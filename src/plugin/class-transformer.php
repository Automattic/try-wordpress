<?php

namespace DotOrg\TryWordPress;

class Transformer {
	public const string META_KEY_LIBERATED_SOURCE = '_data_liberation_source';
	public const string META_KEY_LIBERATED_OUTPUT = '_data_liberation_output';

	public function __construct() {
		TransformersRegistry::add(
			SubjectType::BLOGPOST,
			array(
				'slug'        => 'try_wordpress',
				'description' => 'Try WordPress handling blog-post natively',
			),
			array(
				$this,
				'handler',
			)
		);

		TransformersRegistry::add(
			SubjectType::PAGE,
			array(
				'slug'        => 'try_wordpress',
				'description' => 'Try WordPress handling page natively',
			),
			array(
				$this,
				'handler',
			)
		);
	}

	public function get_post_type( Subject $subject ): string {
		return match ( $subject->type ) {
			'page'  => 'page',
			default => 'post',
		};
	}

	public function handler( Subject $subject ) {
		// Since parsed versions come from paste_handler in frontend, look for them in postmeta, instead of subject instance
		$title = get_post_meta( $subject->id(), 'parsed_title', true );
		if ( empty( $title ) ) {
			$title = '[Title]';
		}
		$body = get_post_meta( $subject->id(), 'parsed_content', true );
		if ( empty( $body ) ) {
			$body = '[Body]';
		}

		$args = array(
			'post_author'  => $subject->author_id(),
			'post_date'    => get_post_meta( $subject->id(), 'parsed_date', true ),
			'post_content' => $body,
			'post_title'   => $title,
			'post_status'  => 'publish',
			'post_type'    => $this->get_post_type( $subject ),
		);

		// have we already transformed this subject before?
		$transformed_post_id = get_post_meta( $subject->id(), self::META_KEY_LIBERATED_OUTPUT, true );
		if ( ! empty( $transformed_post_id ) ) {
			$args['ID'] = $transformed_post_id;
		}

		add_filter( 'wp_insert_post_empty_content', '__return_false' );
		$inserted_post_id = wp_insert_post( $args );
		remove_filter( 'wp_insert_post_empty_content', '__return_false' );

		// @TODO: handle attachments, terms etc in future
		// Note: Do not need anything from postmeta.
		// We should potentially use another plugin here for this purpose and call its API to do it for us.

		if ( 0 === $inserted_post_id ) {
			return null;
		}

		return $inserted_post_id;
	}
}

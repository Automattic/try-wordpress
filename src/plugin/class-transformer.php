<?php

namespace DotOrg\TryWordPress;

use WP_Post;

class Transformer {
	public const string META_KEY_LIBERATED_SOURCE = '_data_liberation_source';
	public const string META_KEY_LIBERATED_OUTPUT = '_data_liberation_output';

	public function __construct() {
		add_action( 'dl_data_saved', array( $this, 'transform' ), 10, 2 );
	}

	private function get_post_type_for_transformed_post( int|WP_Post $liberated_post ): string {
		if ( is_int( $liberated_post ) ) {
			$liberated_post = get_post( $liberated_post );
		}

		$subject_type = get_post_meta( $liberated_post->ID, 'subject_type', true );
		switch ( $subject_type ) {
			case 'blog-post':
				$post_type = 'post';
				break;
			case 'product':
				$post_type = 'product';
				break;
			case 'page':
				$post_type = 'page';
				break;
			default:
				$post_type = 'post';
		}

		// @TODO: filter name would be changed w.r.t new verb in place of 'transformed' once its decided
		return apply_filters( 'post_type_for_transformed_post', $post_type, $liberated_post );
	}

	public function transform( Subject $subject, string $verb ): bool {
		if ( apply_filters( 'skip_native_transformation', false ) ) {
			return true;
		}

		$liberated_post_id = $subject->id();
		$liberated_post    = get_post( $liberated_post_id );

		$transformed_post_id = get_post_meta( $liberated_post->ID, self::META_KEY_LIBERATED_OUTPUT, true );

		$title = get_post_meta( $liberated_post->ID, 'parsed_title', true );
		if ( empty( $title ) ) {
			$title = '[Title]';
		}
		$body = get_post_meta( $liberated_post->ID, 'parsed_content', true );
		if ( empty( $body ) ) {
			$body = '[Body]';
		}

		$args = array(
			'post_author'  => $liberated_post->post_author,
			'post_date'    => get_post_meta( $liberated_post->ID, 'parsed_date', true ),
			'post_content' => $body,
			'post_title'   => $title,
			'post_status'  => 'publish',
			'post_type'    => $this->get_post_type_for_transformed_post( $liberated_post->ID ),
		);
		if ( ! empty( $transformed_post_id ) ) {
			$args['ID'] = $transformed_post_id;
		}

		add_filter( 'wp_insert_post_empty_content', '__return_false' );
		$inserted_post_id = wp_insert_post( $args, true );
		remove_filter( 'wp_insert_post_empty_content', '__return_false' );

		// @TODO: handle attachments, terms etc in future
		// Note: Do not need anything from postmeta.
		// We should potentially use another plugin here for this purpose and call its API to do it for us.

		if ( 0 === $inserted_post_id || is_wp_error( $inserted_post_id ) ) {
			return false;
		}

		update_post_meta( $inserted_post_id, self::META_KEY_LIBERATED_SOURCE, $liberated_post->ID );
		update_post_meta( $liberated_post->ID, self::META_KEY_LIBERATED_OUTPUT, $inserted_post_id );
		return true;
	}
}

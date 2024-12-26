<?php

namespace DotOrg\TryWordPress;

use WP_Post;

/**
 * Subject class offers an easy view of liberated data, abstracting away the implementation details
 *
 * WP specific data is private and only exposed via methods to limit leakage of implementation details
 * Raw data is available as public fields
 */
class Subject {

	private int $id;
	private int $author_id;

	public string $source_html;
	public string $source_url;
	public string $type;
	public string $title;
	public string $date;
	public string $content;

	/**
	 * Creates a new Subject instance from a WordPress post.
	 *
	 * @param int $post_id The WordPress post ID to create the subject from.
	 * @return Subject|false The Subject instance or false if the post doesn't exist.
	 */
	public static function from_post( int $post_id ): Subject|false {
		$post = get_post( $post_id );

		if ( ! $post instanceof WP_Post ) {
			return false;
		}

		return new self( $post );
	}

	/**
	 * Private constructor to enforce using the factory method.
	 *
	 * @param WP_Post $post The WordPress post to create the subject from.
	 */
	private function __construct( WP_Post $post ) {
		$this->id          = $post->ID;
		$this->author_id   = $post->post_author;
		$this->source_html = $post->post_content_filtered;
		$this->source_url  = $post->guid;

		$this->type    = get_post_meta( $post->ID, 'subject_type', true );
		$this->title   = get_post_meta( $post->ID, 'raw_title', true );
		$this->date    = get_post_meta( $post->ID, 'raw_date', true );
		$this->content = get_post_meta( $post->ID, 'raw_content', true );
	}

	public function id(): int {
		return $this->id;
	}

	public function author_id(): int {
		return $this->author_id;
	}
}

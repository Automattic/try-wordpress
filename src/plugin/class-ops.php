<?php

namespace DotOrg\TryWordPress;

use WP_Post;

class Ops {
	private static string $post_type;

	public static function init( string $post_type ): void {
		static::$post_type = $post_type;
	}

	/**
	 * Register your handler for the specified subject type
	 *
	 * @param SubjectType $subject_type Type of subject.
	 * @param array       $identifier Array containing unique slug and description.
	 * @param callable    $handler Function that would handle the transformation of subject for the specific subject type.
	 * @return void
	 */
	public static function handle( SubjectType $subject_type, array $identifier, callable $handler ): void {
		Handlers_Registry::add( $subject_type, $identifier, $handler );
	}

	/**
	 * Register your handler for the specified subject type to just observe (read-only) data
	 *
	 * @param SubjectType $subject_type Type of subject.
	 * @param array       $identifier Array containing unique slug and description.
	 * @param callable    $handler Function that would handle the transformation of subject for the specific subject type.
	 * @return void
	 */
	public static function observe( SubjectType $subject_type, array $identifier, callable $handler ): void {
		Observers_Registry::add( $subject_type, $identifier, $handler );
	}

	/**
	 * Loops over all liberated_post posts for the specified subject_type
	 *
	 * @TODO: pagination support
	 *
	 * @param SubjectType $subject_type Type of subject.
	 * @return Subject[]
	 */
	public static function loop( SubjectType $subject_type ): array {
		$args  = array(
			'post_type'      => static::$post_type,
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			// @phpcs:ignore
			'meta_query'     => array(
				'key'     => 'subject_type',
				'value'   => $subject_type->value,
				'compare' => '=',
			),
		);
		$posts = get_posts( $args );

		return array_map(
			fn( WP_Post $post ) => Subject::from_post( $post->ID ),
			$posts
		);
	}
}

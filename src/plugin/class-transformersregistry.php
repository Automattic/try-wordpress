<?php

namespace DotOrg\TryWordPress;

use Exception;
use InvalidArgumentException;

class TransformersRegistry {
	private static string $user_choice_meta_key_prefix = '_data_liberation_chosen_handler_';
	private static array $handlers                     = array();

	/**
	 * Add a handler for a specific subject type
	 *
	 * @param SubjectType $type The subject type for which handler should be registered.
	 * @param array       $identifier Array containing unique slug and description.
	 * @param callable    $handler The handler function.
	 * @return void
	 * @throws InvalidArgumentException If handler is not callable.
	 */
	public static function add( SubjectType $type, array $identifier, callable $handler ): void {
		if ( ! is_callable( $handler ) ) {
			throw new InvalidArgumentException( 'Handler must be callable' );
		}

		if ( ! isset( $identifier['slug'] ) ) {
			throw new InvalidArgumentException( 'Identifier slug must be defined' );
		}

		if ( ! isset( self::$handlers[ $type->value ] ) ) {
			self::$handlers[ $type->value ] = array();
		}

		self::$handlers[ $type->value ][ $identifier['slug'] ] = array(
			'slug'        => $identifier['slug'],
			'description' => $identifier['desc'],
			'handler'     => $handler,
		);
	}

	/**
	 * Check if handlers exist for a type
	 *
	 * @param SubjectType $type The subject type to check for.
	 * @return bool True if handlers exist
	 */
	public static function has( SubjectType $type ): bool {
		return isset( self::$handlers[ $type->value ] ) && ! empty( self::$handlers[ $type->value ] );
	}

	/**
	 * Check if there is a "compete" i.e., multiple handlers for a type
	 *
	 * @param SubjectType $type The subject type to check for.
	 * @return bool True if handlers exist
	 */
	public static function is_compete( SubjectType $type ): bool {
		return isset( self::$handlers[ $type->value ] ) && count( self::$handlers[ $type->value ] ) > 1;
	}

	/**
	 * Execute all handlers for a type
	 *
	 * @param SubjectType $type The subject type to handle.
	 * @param Subject     $subject Data to pass to handlers.
	 * @return void
	 * @throws Exception If no handler has been registered or user choice hasn't been set when multiples are registered.
	 */
	public static function handle( SubjectType $type, Subject $subject ): void {
		if ( ! self::has( $type ) ) {
			throw new Exception( sprintf( 'no handler registered for type: %s', esc_html( $type->value ) ) );
		}

		if ( self::is_compete( $type ) ) {
			$choice = self::get_user_choice( $type );
			if ( ! empty( $choice ) ) {
				$chosen = self::$handlers[ $type->value ][ $choice ];
			} else {
				throw new Exception( 'handle() invoked without user choice on compete' );
			}
		} else {
			$chosen = current( self::$handlers[ $type->value ] );
		}

		$transformed_post_id = $chosen['handler']( $subject );

		if ( $transformed_post_id ) {
			update_post_meta( $subject->id(), Transformer::META_KEY_LIBERATED_OUTPUT, $transformed_post_id );
			update_post_meta( $transformed_post_id, Transformer::META_KEY_LIBERATED_SOURCE, $subject->id() );
		}
	}

	/**
	 * Remove all handlers for a type
	 *
	 * @param SubjectType $type The type to clear handlers for.
	 * @return void
	 */
	public static function clear( SubjectType $type ): void {
		if ( isset( self::$handlers[ $type->value ] ) ) {
			unset( self::$handlers[ $type->value ] );
		}
	}

	/**
	 * Set user choice for what transformer to run for a subject type when multiples are registered
	 *
	 * @param SubjectType $type The subject type for which choice is to be saved.
	 * @param string      $transformer_slug Identifying slug of the chosen transformer.
	 * @return void
	 */
	public static function set_user_choice( SubjectType $type, string $transformer_slug ): void {
		update_user_meta( get_current_user_id(), self::$user_choice_meta_key_prefix . $type->value, $transformer_slug );
	}

	/**
	 * Retrieves the user choice for what transformer to run for a subject type when multiples are registered
	 *
	 * @param SubjectType $type The subject type for which choice is to be retrieved.
	 * @return string $transformer_slug Identifying slug of the chosen transformer.
	 */
	public static function get_user_choice( SubjectType $type ): string {
		return get_user_meta( get_current_user_id(), self::$user_choice_meta_key_prefix . $type->value, true );
	}
}

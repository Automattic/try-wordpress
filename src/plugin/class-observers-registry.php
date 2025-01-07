<?php

namespace DotOrg\TryWordPress;

use Exception;
use InvalidArgumentException;

class Observers_Registry {
	private static array $observers = array();

	/**
	 * Add a observer for a specific subject type
	 *
	 * @param SubjectType $type The subject type for which observer should be registered.
	 * @param array       $identifier Array containing unique slug and description.
	 * @param callable    $observer The observer function.
	 * @return void
	 * @throws InvalidArgumentException If observer is not callable.
	 */
	public static function add( SubjectType $type, array $identifier, callable $observer ): void {
		if ( ! is_callable( $observer ) ) {
			throw new InvalidArgumentException( 'observer must be callable' );
		}

		if ( ! isset( $identifier['slug'] ) ) {
			throw new InvalidArgumentException( 'Identifier slug must be defined' );
		}

		if ( ! isset( self::$observers[ $type->value ] ) ) {
			self::$observers[ $type->value ] = array();
		}

		self::$observers[ $type->value ][ $identifier['slug'] ] = array(
			'slug'        => $identifier['slug'],
			'description' => $identifier['description'],
			'observer'    => $observer,
		);
	}

	/**
	 * Check if observers exist for a type
	 *
	 * @param SubjectType $type The subject type to check for.
	 * @return bool True if observers exist
	 */
	public static function has( SubjectType $type ): bool {
		return isset( self::$observers[ $type->value ] ) && ! empty( self::$observers[ $type->value ] );
	}

	/**
	 * Execute all observers for a type
	 *
	 * @param SubjectType $type The subject type to handle.
	 * @param Subject     $subject Data to pass to observers.
	 * @return void
	 */
	public static function observe( SubjectType $type, Subject $subject ): void {
		if ( ! self::has( $type ) ) {
			return;
		}
		foreach ( self::$observers[ $type->value ] as $registered_observer ) {
			$registered_observer['observer']( $subject );
		}
	}
}

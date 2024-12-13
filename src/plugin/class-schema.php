<?php

namespace DotOrg\TryWordPress;

class Schema {
	private static ?array $schema = null;

	private static function load_schema(): void {
		if ( null === self::$schema ) {
			$schema_path  = plugin_dir_path( __FILE__ ) . 'schema.json';
			self::$schema = wp_json_file_decode( $schema_path, array( 'associative' => true ) );

			if ( json_last_error() !== JSON_ERROR_NONE ) {
				wp_die( esc_html( 'Failed to parse schema.json - ' . json_last_error_msg() ) );
			}
		}
	}

	public static function get( $subject_type ): ?array {
		self::load_schema();
		if ( $subject_type ) {
			return self::$schema[ $subject_type ] ?? null;
		}
		return self::$schema;
	}
}

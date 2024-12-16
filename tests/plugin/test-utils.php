<?php

use function DotOrg\TryWordPress\convert_schema_type_to_rest_api_type;

class Test_Utils extends \WP_UnitTestCase {
	/**
	 * Tests the conversion of schema types to REST API types.
	 *
	 * @dataProvider data_convert_schema_type_to_rest_api_type
	 * @param string $input    The input schema type to convert.
	 * @param string $expected The expected REST API type.
	 */
	public function test_convert_schema_type_to_rest_api_type( string $input, string $expected ) {
		$this->assertEquals( $expected, convert_schema_type_to_rest_api_type( $input ) );
	}

	/**
	 * Data provider for test_convert_schema_type_to_rest_api_type.
	 *
	 * @return array[] Test cases with input and expected output.
	 */
	public function data_convert_schema_type_to_rest_api_type(): array {
		return array(
			'html type converts to string'   => array(
				'html',
				'string',
			),
			'text type converts to string'   => array(
				'text',
				'string',
			),
			'date type converts to string'   => array(
				'date',
				'string',
			),
			'number type remains unchanged'  => array(
				'number',
				'number',
			),
			'boolean type remains unchanged' => array(
				'boolean',
				'boolean',
			),
			'integer type remains unchanged' => array(
				'integer',
				'integer',
			),
		);
	}
}

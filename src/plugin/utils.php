<?php

namespace DotOrg\TryWordPress;

/**
 * Function to convert type values specified by schema to one that's compatible with REST API
 *
 * REST API only accepts the following as type:
 * 'array', 'object', 'string', 'number', 'integer', 'boolean', null
 *
 * And in our schema, we have types like 'html', 'text'
 *
 * @param string $type Type from our schema.
 * @return string Type that REST API accepts
 */
function convert_schema_type_to_rest_api_type( string $type ): string {
	return match ( $type ) {
		'html', 'text', 'date' => 'string',
		default => $type,
	};
}

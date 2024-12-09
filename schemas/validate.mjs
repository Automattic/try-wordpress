#!/usr/bin/env node

// eslint-disable-next-line import/no-extraneous-dependencies
import { Ajv } from 'ajv';
import { fileURLToPath } from 'url';
import * as path from 'node:path';
import { readFileSync } from 'node:fs';
import * as fs from 'node:fs';

const schemaDir = path.dirname( fileURLToPath( import.meta.url ) );
const jsonSchemaName = 'json-schema.json';
const jsonSchema = JSON.parse(
	readFileSync( path.join( schemaDir, jsonSchemaName ) ).toString()
);

const schemas = fs
	.readdirSync( schemaDir )
	.filter( ( file ) => file.endsWith( '.json' ) && file !== jsonSchemaName )
	.map( ( file ) =>
		JSON.parse( readFileSync( path.join( schemaDir, file ) ).toString() )
	);

const validate = new Ajv( {
	allErrors: true,
	verbose: true,
} ).compile( jsonSchema );

const errors = [];
for ( const schema of schemas ) {
	if ( ! validate( schema ) ) {
		errors.push( ...validate.errors );
	}
}

if ( errors.length > 0 ) {
	console.error( errors );
	console.error( '\x1b[31m%s\x1b[0m', 'Schema validation failed' );
	process.exit( 1 );
}

#!/usr/bin/env node

// eslint-disable-next-line import/no-extraneous-dependencies
import { Ajv } from 'ajv';
import { fileURLToPath } from 'url';
import * as path from 'node:path';
import { readFileSync } from 'node:fs';
import * as fs from 'node:fs';

const schemaDir = path.dirname( fileURLToPath( import.meta.url ) );
const metaSchemaPath = path.join( schemaDir, 'meta', 'schema.json' );
const metaSchema = JSON.parse( readFileSync( metaSchemaPath ).toString() );

const schemas = fs
	.readdirSync( schemaDir )
	.filter( ( file ) => file.endsWith( '.json' ) )
	.map( ( file ) =>
		JSON.parse( readFileSync( path.join( schemaDir, file ) ).toString() )
	);

const validate = new Ajv( {
	allErrors: true,
	verbose: true,
} ).compile( metaSchema );

const slugs = new Set();
const errors = [];
for ( const schema of schemas ) {
	if ( slugs.has( schema.slug ) ) {
		console.error(
			`A schema with slug "${ schema.slug }" already exists.`
		);
		process.exit( 1 );
	}
	slugs.add( schema.slug );
	if ( ! validate( schema ) ) {
		errors.push( ...validate.errors );
	}
}

if ( errors.length > 0 ) {
	console.error( errors );
	console.error( 'Schema validation failed' );
	process.exit( 1 );
}

console.log( 'Schema validation succeeded' );

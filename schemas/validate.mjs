#!/usr/bin/env node

import { fileURLToPath } from 'url';
import * as path from 'node:path';
import { readFileSync } from 'node:fs';
import { Ajv } from 'ajv';

const schemaDir = path.dirname( fileURLToPath( import.meta.url ) );
const jsonSchemaPath = path.join( schemaDir, 'json-schema.json' );
const dataPath = path.join( schemaDir, 'data.json' );

const schema = JSON.parse( readFileSync( jsonSchemaPath ).toString() );
const data = JSON.parse( readFileSync( dataPath ).toString() );

const ajv = new Ajv( {
	allErrors: true,
	verbose: true,
} );
const validate = ajv.compile( schema );
if ( ! validate( data ) ) {
	console.error( validate.errors );
	process.exit( 1 );
}

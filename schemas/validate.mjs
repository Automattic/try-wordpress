#!/usr/bin/env node

import { fileURLToPath } from 'url';
import * as path from 'node:path';
import { readFileSync } from 'node:fs';
import { Ajv } from 'ajv';

const cwd = path.dirname( fileURLToPath( import.meta.url ) );
const schemaPath = path.join( cwd, 'schema.json' );
const dataPath = path.join( cwd, 'data.json' );

const schema = JSON.parse( readFileSync( schemaPath ).toString() );
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

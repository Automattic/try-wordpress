// eslint-disable-next-line import/no-unresolved
import SchemasJson from '@schema/schema.json';
import { SubjectType } from '@/model/Subject';
import { FieldType } from '@/model/field/Field';

interface Schemas {
	[ key: SubjectType ]: Schema;
}

interface SchemaField {
	description: string;
	type: FieldType;
}

interface Schema {
	title: string;
	slug: SubjectType;
	fields: Record< string, SchemaField >;
}

const schemas: Schemas = SchemasJson as Schemas;

export function getSchemas(): Schemas {
	return schemas;
}

export function getSchema( subjectType: SubjectType ): Schema {
	if ( ! schemas.hasOwnProperty( subjectType ) ) {
		throw new Error( `Unknown subjectType: ${ subjectType }` );
	}
	return schemas[ subjectType ];
}

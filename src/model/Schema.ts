// eslint-disable-next-line import/no-unresolved
import SchemasJson from '@schema/schema.json';
import { SubjectType } from '@/model/Subject';

interface Schemas {
	[ key: string ]: Schema;
}

interface Schema {
	title: string;
	slug: string;
	fields: Record< string, any >;
}

const schemas: Schemas = SchemasJson as Schemas;

export function getSchema( subjectType: SubjectType ): Schema {
	if ( ! schemas.hasOwnProperty( subjectType ) ) {
		throw new Error( `Unknown subjectType: ${ subjectType }` );
	}
	return schemas[ subjectType ];
}

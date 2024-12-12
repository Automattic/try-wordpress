// eslint-disable-next-line import/no-unresolved
import Schema from '@schema/schema.json';
import { SubjectType } from '@/model/subject/Subject';

export function getSchema( subjectType: SubjectType ) {
	if ( ! Schema.hasOwnProperty( subjectType ) ) {
		throw new Error( `Unknown subjectType: ${ subjectType }` );
	}
	return Schema[ subjectType ];
}

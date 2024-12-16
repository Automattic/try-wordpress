import { Field } from '@/model/field/Field';

// Some subject types have a custom import UI, where the user manually imports each subject of that type.
// These types are listed here so that we can centralize their slugs, and navigate to places in the code where they are referenced.
export enum ManualSubjectTypes {
	Page = 'page',
}

export enum SubjectType {
	BlogPost = 'blog-post',
	Page = 'page',
}

export interface Subject {
	type: SubjectType;
	id: number;
	transformedId: number;
	sourceUrl: string;
	previewUrl: string;
	fields: Record< string, Field >;
}

export function validateFields( subject: Subject ): boolean {
	let isValid = true;
	Object.keys( subject.fields ).forEach( ( key ) => {
		const f = subject.fields[ key ];
		if ( f.rawValue === '' || f.parsedValue === '' ) {
			isValid = false;
		}
	} );
	return isValid;
}

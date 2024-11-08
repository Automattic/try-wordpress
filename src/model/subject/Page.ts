import { Subject, SubjectType } from '@/model/subject/Subject';
import { newTextField, TextField } from '@/model/field/TextField';
import { HtmlField, newHtmlField } from '@/model/field/HtmlField';
import { DateField, newDateField } from '@/model/field/DateField';

export interface Page extends Subject {
	type: SubjectType.Page;
	date: DateField;
	title: TextField;
	content: HtmlField;
}

export function newPage( sourceUrl: string ): Page {
	return {
		id: 0,
		transformedId: 0,
		previewUrl: '',
		type: SubjectType.Page,
		sourceUrl,
		date: newDateField(),
		title: newTextField(),
		content: newHtmlField(),
	};
}

export function validatePage( page: Page ): boolean {
	const fields = [ page.title, page.date, page.content ];
	let isValid = true;
	for ( const f of fields ) {
		if ( f.rawValue === '' || f.parsedValue === '' ) {
			isValid = false;
			break;
		}
	}
	return isValid;
}

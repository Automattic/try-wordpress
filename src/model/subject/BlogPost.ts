import { Subject, SubjectType } from '@/model/subject/Subject';
import { DateField, newDateField } from '@/model/field/DateField';
import { newTextField, TextField } from '@/model/field/TextField';
import { HtmlField, newHtmlField } from '@/model/field/HtmlField';

export interface BlogPost extends Subject {
	type: SubjectType.BlogPost;
	date: DateField;
	title: TextField;
	content: HtmlField;
}

export function newBlogPost( sourceUrl: string ): BlogPost {
	return {
		id: 0,
		type: SubjectType.BlogPost,
		transformedId: 0,
		previewUrl: '',
		sourceUrl,
		date: newDateField(),
		title: newTextField(),
		content: newHtmlField(),
	};
}

export function validateBlogPost( blogPost: BlogPost ): boolean {
	const fields = [ blogPost.title, blogPost.date, blogPost.content ];
	let isValid = true;
	for ( const f of fields ) {
		if ( f.rawValue === '' || f.parsedValue === '' ) {
			isValid = false;
			break;
		}
	}
	return isValid;
}

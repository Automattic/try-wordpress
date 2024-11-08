import { Field, FieldType } from '@/model/field/Field';

export interface HtmlField extends Field {
	type: FieldType.Html;
	parsedValue: string;
}

export function newHtmlField(
	raw: string = '',
	parsed: string = ''
): HtmlField {
	return {
		type: FieldType.Html,
		rawValue: raw,
		parsedValue: parsed,
	};
}

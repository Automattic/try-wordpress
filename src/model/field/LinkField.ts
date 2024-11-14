import { Field, FieldType } from '@/model/field/Field';

export interface LinkField extends Field {
	type: FieldType.Link;
	parsedValue: {
		title: string;
		url: string;
	};
}

export function newLinkField(
	raw: string = '',
	title: string,
	url: string
): LinkField {
	return {
		type: FieldType.Link,
		rawValue: raw,
		parsedValue: { title, url },
	};
}

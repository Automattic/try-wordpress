import { Field, FieldType } from '@/model/field/Field';

export interface TextField extends Field {
	type: FieldType.Text;
	parsedValue: string;
}

export function newTextField(
	raw: string = '',
	parsed: string = ''
): TextField {
	return {
		type: FieldType.Text,
		rawValue: raw,
		parsedValue: parsed,
	};
}

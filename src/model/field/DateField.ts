import { Field, FieldType } from '@/model/field/Field';

export interface DateField extends Field {
	type: FieldType.Date;
	rawValue: string;
	parsedValue: Date;
}

export function newDateField(
	raw: string = '',
	parsed: string = ''
): DateField {
	const date = parsed === '' ? new Date() : new Date( parsed );
	return {
		type: FieldType.Date,
		rawValue: raw,
		parsedValue: date,
	};
}

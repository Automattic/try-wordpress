export enum FieldType {
	Date = 'date',
	Text = 'text',
	Html = 'html',
}

export interface Field {
	type: FieldType;
	rawValue: string;
	parsedValue: any;
}

export enum FieldType {
	Date = 'date',
	Text = 'text',
	Html = 'html',
	Link = 'link',
}

export interface Field {
	type: FieldType;
	rawValue: string;
	parsedValue: any;
}

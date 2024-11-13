import { Field, FieldType } from '@/model/field/Field';
import { FieldsEditor } from '@/ui/components/FieldsEditor/FieldsEditor';
import { PageBlueprint } from '@/model/blueprint/Page';
import { Page } from '@/model/subject/Page';

interface Props {
	blueprint: PageBlueprint;
	subject: Page;
	onFieldChanged: ( name: string, field: Field, selector: string ) => void;
}

export function PageBlueprintEditor( props: Props ) {
	const { blueprint, subject, onFieldChanged } = props;

	const subjectFields: { name: string; field: Field }[] = [
		{ name: 'title', field: subject.title },
		{ name: 'content', field: subject.content },
	];

	const blueprintFields: {
		name: string;
		type: FieldType;
		selector?: string;
	}[] = [
		{
			name: 'title',
			type: blueprint.fields.title.type,
			selector: blueprint.fields.title.selector,
		},
		{
			name: 'content',
			type: blueprint.fields.content.type,
			selector: blueprint.fields.content.selector,
		},
	];

	return (
		<FieldsEditor
			fields={ subjectFields }
			blueprintFields={ blueprintFields }
			onFieldChanged={ onFieldChanged }
		/>
	);
}

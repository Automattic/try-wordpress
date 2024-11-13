import { Field, FieldType } from '@/model/field/Field';
import { BlogPost } from '@/model/subject/BlogPost';
import { BlogPostBlueprint } from '@/model/blueprint/BlogPost';
import { FieldsEditor } from '@/ui/components/FieldsEditor/FieldsEditor';

interface Props {
	blueprint: BlogPostBlueprint;
	subject: BlogPost;
	onFieldChanged: ( name: string, field: Field, selector: string ) => void;
}

export function BlogPostBlueprintEditor( props: Props ) {
	const { blueprint, subject, onFieldChanged } = props;

	const subjectFields: { name: string; field: Field }[] = [
		{ name: 'title', field: subject.title },
		{ name: 'date', field: subject.date },
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
			name: 'date',
			type: blueprint.fields.date.type,
			selector: blueprint.fields.date.selector,
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

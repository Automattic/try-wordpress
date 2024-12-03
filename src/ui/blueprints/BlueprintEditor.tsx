import { Field } from '@/model/field/Field';
import { FieldsEditor } from '@/ui/components/FieldsEditor/FieldsEditor';
import { getSchema } from '@/model/subject/Schema';
import { Subject } from '@/model/subject/Subject';
import { Blueprint } from '@/model/Blueprint';

interface Props {
	blueprint: Blueprint;
	subject: Subject;
	onFieldChanged: ( name: string, field: Field, selector: string ) => void;
}

export function BlueprintEditor( props: Props ) {
	const { blueprint, subject, onFieldChanged } = props;
	const schema = getSchema( subject.type );
	const schemaFields = schema.fields;

	const subjectFields: { name: string; field: Field }[] = [];
	const selectors: {
		name: string;
		selector?: string;
	}[] = [];

	Object.keys( schemaFields ).forEach( ( name ) => {
		subjectFields.push( {
			name,
			field: subject.fields[ name ],
		} );
		selectors.push( {
			name,
			selector: blueprint.selectors[ name ],
		} );
	} );

	return (
		<FieldsEditor
			fields={ subjectFields }
			selectors={ selectors }
			onFieldChanged={ onFieldChanged }
		/>
	);
}

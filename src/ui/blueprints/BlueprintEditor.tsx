import { Field } from '@/model/field/Field';
import { FieldsEditor } from '@/ui/components/FieldsEditor/FieldsEditor';
import { getSchema } from '@/model/Schema';
import { Subject } from '@/model/Subject';
import { Blueprint } from '@/model/Blueprint';

interface Props {
	blueprint: Blueprint;
	subject: Subject;
	onFieldChanged: ( name: string, field: Field, selector: string ) => void;
}

export function BlueprintEditor( props: Props ) {
	const { blueprint, subject, onFieldChanged } = props;
	const schema = getSchema( subject.type );

	const fields: Record< string, Field > = {};
	const selectors: { name: string; selector?: string }[] = [];

	Object.keys( schema.fields ).forEach( ( name ) => {
		fields[ name ] = subject.fields[ name ];
		selectors.push( {
			name,
			selector: blueprint.selectors[ name ],
		} );
	} );

	return (
		<FieldsEditor
			fields={ fields }
			selectors={ selectors }
			onFieldChanged={ onFieldChanged }
		/>
	);
}

import { Field } from '@/model/field/Field';
import { FieldsEditor } from '@/ui/components/FieldsEditor/FieldsEditor';
import { Subject } from '@/model/Subject';
import { Blueprint } from '@/model/Blueprint';

interface Props {
	blueprint: Blueprint;
	subject: Subject;
	onFieldChanged: ( name: string, field: Field, selector: string ) => void;
}

export function BlueprintEditor( props: Props ) {
	const { blueprint, subject, onFieldChanged } = props;
	return (
		<FieldsEditor
			subject={ subject }
			selectors={ blueprint.selectors }
			onFieldChanged={ onFieldChanged }
		/>
	);
}

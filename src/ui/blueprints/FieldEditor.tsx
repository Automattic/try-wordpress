import { BlueprintField } from '@/model/blueprint/Blueprint';
import { Field } from '@/model/field/Field';

export function FieldEditor( props: {
	field: Field;
	blueprintField: BlueprintField;
	label: string;
	waitingForSelection: boolean;
	onWaitingForSelection: ( field: Field | false ) => void;
	onClear: () => void;
} ) {
	const {
		blueprintField,
		field,
		label,
		waitingForSelection,
		onWaitingForSelection,
		onClear,
	} = props;

	return (
		<fieldset>
			<legend>{ label } </legend>
			<div>
				<button
					disabled={ waitingForSelection }
					onClick={ () => onWaitingForSelection( field ) }
				>
					Select
				</button>
				{ ! waitingForSelection ? null : (
					<button
						className="outline"
						onClick={ () => onWaitingForSelection( false ) }
					>
						Cancel
					</button>
				) }
			</div>
			<div style={ { paddingTop: '1rem' } }>
				<pre>
					selector (
					<button
						className="minimal"
						disabled={
							waitingForSelection || field.rawValue === ''
						}
						onClick={ onClear }
					>
						Clear
					</button>
					) :
				</pre>
				{ blueprintField.selector }
			</div>
			<div style={ { paddingTop: '1rem' } }>
				original: { field.rawValue }
			</div>
			<div style={ { paddingTop: '1rem' } }>
				parsed: { field.parsedValue.toString() }
			</div>
		</fieldset>
	);
}

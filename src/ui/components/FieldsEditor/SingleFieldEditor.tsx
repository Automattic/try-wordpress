import { BlueprintField } from '@/model/blueprint/Blueprint';
import { Field } from '@/model/field/Field';

export function SingleFieldEditor( props: {
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
			<div>
				<p>
					Selector (
					<button
						className="button-inline"
						disabled={
							waitingForSelection || field.rawValue === ''
						}
						onClick={ onClear }
					>
						Clear
					</button>
					):
				</p>
				{ blueprintField.selector }
			</div>
			<div>
				Original:
				<br />
				<div className="string">{ field.rawValue }</div>
			</div>
			<div>
				Parsed:
				<br />
				<div className="string">{ field.parsedValue.toString() }</div>
			</div>
		</fieldset>
	);
}

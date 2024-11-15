import { Field } from '@/model/field/Field';
import { Button } from '@wordpress/components';

export function SingleFieldEditor( props: {
	field: Field;
	label: string;
	selector?: string;
	waitingForSelection: boolean;
	onWaitingForSelection: ( field: Field | false ) => void;
	onClear: () => void;
} ) {
	const {
		field,
		label,
		selector,
		waitingForSelection,
		onWaitingForSelection,
		onClear,
	} = props;

	return (
		<fieldset>
			<legend>{ label } </legend>
			<div>
				<Button
					variant="primary"
					disabled={ waitingForSelection }
					onClick={ () => onWaitingForSelection( field ) }
				>
					Select
				</Button>
				{ ! waitingForSelection ? null : (
					<Button
						variant="secondary"
						onClick={ () => onWaitingForSelection( false ) }
					>
						Cancel
					</Button>
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
				{ selector }
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

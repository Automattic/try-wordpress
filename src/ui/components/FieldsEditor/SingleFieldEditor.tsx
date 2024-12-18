import { Field } from '@/model/field/Field';
import { Button, ButtonGroup } from '@wordpress/components';

export function SingleFieldEditor( props: {
	field: Field;
	label: string;
	description: string;
	selector: string;
	waitingForSelection: boolean;
	onWaitingForSelection: ( field: Field | false ) => void;
	onClear: () => void;
} ) {
	const {
		field,
		label,
		description,
		selector,
		waitingForSelection,
		onWaitingForSelection,
		onClear,
	} = props;

	return (
		<fieldset>
			<legend>{ label } </legend>
			<div className="field-description">{ description }</div>
			<div>
				<ButtonGroup>
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
				</ButtonGroup>
			</div>
			<div>
				<p>
					Selector (
					<Button
						variant="link"
						className="button-inline"
						disabled={
							waitingForSelection || field.rawValue === ''
						}
						onClick={ onClear }
					>
						Clear
					</Button>
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

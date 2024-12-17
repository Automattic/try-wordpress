import { Field } from '@/model/field/Field';
import { ReactElement, useEffect, useState } from 'react';
import { CommandTypes, sendCommandToContent } from '@/bus/Command';
import { SingleFieldEditor } from '@/ui/components/FieldsEditor/SingleFieldEditor';
import { EventTypes } from '@/bus/Event';
import { ContentEventHandler } from '@/ui/components/ContentEventHandler';
import { Subject } from '@/model/Subject';
import { getSchema } from '@/model/Schema';

// Displays a list of fields that can be "edited" by selecting the content of each field,
// which is done by clicking on elements in the source site.
export function FieldsEditor( props: {
	subject: Subject;
	selectors?: Record< string, string >;
	onFieldChanged: ( name: string, field: Field, selector: string ) => void;
} ) {
	const { subject, selectors, onFieldChanged } = props;
	const schema = getSchema( subject.type );
	const [ fieldWaitingForSelection, setFieldWaitingForSelection ] = useState<
		false | { field: Field; name: string }
	>( false );

	const fields = subject.fields;

	// Filter out fields that are not in the schema.
	// TODO: Move this to SubjectsApi so that a Subject is guaranteed to not have unknown fields.
	Object.keys( subject.fields ).forEach( ( name ) => {
		if ( ! schema.fields[ name ] ) {
			delete fields[ name ];
		}
	} );

	// Enable or disable highlighting according to whether a field is waiting for selection.
	useEffect( () => {
		const type =
			fieldWaitingForSelection === false
				? CommandTypes.SwitchToDefaultMode
				: CommandTypes.SwitchToGenericSelectionMode;
		void sendCommandToContent( { type, payload: {} } );
	}, [ fieldWaitingForSelection ] );

	// Render each field.
	const elements: ReactElement[] = [];
	for ( const name in fields ) {
		const field = fields[ name ];
		const isWaitingForSelection =
			!! fieldWaitingForSelection &&
			fieldWaitingForSelection.name === name;

		elements.push(
			<SingleFieldEditor
				key={ name }
				field={ field }
				label={ name }
				selector={ selectors ? selectors[ name ] : '' }
				waitingForSelection={ isWaitingForSelection }
				onWaitingForSelection={ async ( f: Field | false ) => {
					if ( f === false ) {
						setFieldWaitingForSelection( false );
					} else {
						setFieldWaitingForSelection( { field: f, name } );
					}
				} }
				onClear={ async () => {
					field.rawValue = '';
					field.parsedValue = '';
					onFieldChanged( name, field, '' );
				} }
			/>
		);
	}

	return (
		<>
			{ /*
			Handle a click on an element in the content script,
			according to which field is currently waiting for selection.
			*/ }
			<ContentEventHandler
				eventType={ EventTypes.OnElementClick }
				onEvent={ async ( event ) => {
					if ( fieldWaitingForSelection === false ) {
						console.warn(
							'Received an OnElementClick event but no field is waiting for selection'
						);
						return;
					}
					const selector = ' ';
					fieldWaitingForSelection.field.rawValue = (
						event.event.payload as any
					 ).content;
					onFieldChanged(
						fieldWaitingForSelection.name,
						fieldWaitingForSelection.field,
						selector
					);
					setFieldWaitingForSelection( false );
				} }
			/>
			{ elements }
		</>
	);
}

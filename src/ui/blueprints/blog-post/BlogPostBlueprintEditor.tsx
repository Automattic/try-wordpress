import { ReactElement, useEffect, useState } from 'react';
import { SingleFieldEditor } from '@/ui/components/FieldsEditor/SingleFieldEditor';
import { Field } from '@/model/field/Field';
import { BlogPost } from '@/model/subject/BlogPost';
import { BlogPostBlueprint } from '@/model/blueprint/BlogPost';
import { CommandTypes, sendCommandToContent } from '@/bus/Command';
import { EventTypes } from '@/bus/Event';
import { ContentEventHandler } from '@/ui/blueprints/ContentEventHandler';

interface Props {
	blueprint: BlogPostBlueprint;
	subject: BlogPost;
	onFieldChanged: ( name: string, field: Field, selector: string ) => void;
}

export function BlogPostBlueprintEditor( props: Props ) {
	const { blueprint, subject, onFieldChanged } = props;
	const [ fieldWaitingForSelection, setFieldWaitingForSelection ] = useState<
		false | { field: Field; name: string }
	>( false );

	const subjectFields: { name: string; field: Field }[] = [
		{ name: 'title', field: subject.title },
		{ name: 'date', field: subject.date },
		{ name: 'content', field: subject.content },
	];

	// Enable or disable highlighting according to whether a field is waiting for selection.
	useEffect( () => {
		const type =
			fieldWaitingForSelection === false
				? CommandTypes.SwitchToDefaultMode
				: CommandTypes.SwitchToGenericSelectionMode;
		void sendCommandToContent( { type, payload: {} } );
	}, [ fieldWaitingForSelection ] );

	const elements: ReactElement[] = [];
	for ( const { name, field } of subjectFields ) {
		const isWaitingForSelection =
			!! fieldWaitingForSelection &&
			fieldWaitingForSelection.name === name;

		const blueprintField =
			blueprint.fields[ name as keyof typeof blueprint.fields ];
		if ( ! blueprintField ) {
			throw new Error( `blueprint field ${ name } not found` );
		}

		elements.push(
			<SingleFieldEditor
				key={ name }
				label={ name }
				blueprintField={ blueprintField }
				field={ field }
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

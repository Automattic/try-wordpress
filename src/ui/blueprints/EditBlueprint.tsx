import { useNavigate, useParams } from 'react-router-dom';
import { ReactElement, useEffect } from 'react';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { Toolbar } from '@/ui/components/Toolbar';
import { validateFields } from '@/model/Subject';
import { Screens } from '@/ui/App';
import { useBlueprint } from '@/ui/hooks/useBlueprint';
import { useSubject } from '@/ui/hooks/useSubject';
import { Field } from '@/model/field/Field';
import { CommandTypes, sendCommandToContent } from '@/bus/Command';
import { Button } from '@wordpress/components';
import { validateBlueprint } from '@/model/Blueprint';
import { parseField } from '@/parser/field';
import { FieldsEditor } from '@/ui/components/FieldsEditor/FieldsEditor';
import { updateBlueprint } from '@/storage/blueprint';

export function EditBlueprint() {
	const params = useParams();
	const blueprintId = params.blueprintId!;
	const [ blueprint, setBlueprint ] = useBlueprint( blueprintId );
	const [ subject, setSubject ] = useSubject(
		blueprint?.type,
		blueprint?.sourceUrl
	);
	const { session, remote } = useSessionContext();
	const navigate = useNavigate();

	// Make the source site navigate to the blueprint's source URL.
	useEffect( () => {
		if ( blueprint ) {
			void sendCommandToContent( {
				type: CommandTypes.NavigateTo,
				payload: { url: blueprint.sourceUrl },
			} );
		}
	}, [ blueprint ] );

	// Make playground navigate to the transformed post of the page.
	useEffect( () => {
		if ( subject && !! remote?.client ) {
			void remote.client.goTo( subject.previewUrl );
		}
	}, [ subject, remote?.client ] );

	// Handle field change events.
	async function onFieldChanged(
		name: string,
		field: Field,
		selector: string
	) {
		if ( ! blueprint || ! subject ) {
			return;
		}

		blueprint.selectors[ name ] = selector;
		blueprint.valid = validateBlueprint( blueprint );
		subject.fields[ name ] = parseField( field );

		const bp = await updateBlueprint( blueprint );
		setBlueprint( bp );

		const p = await remote!.api!.subjects.update( subject );
		setSubject( p );
	}

	let isValid = false;
	let editor: ReactElement | undefined;

	if ( blueprint && subject ) {
		editor = (
			<FieldsEditor
				subject={ subject }
				selectors={ blueprint.selectors }
				onFieldChanged={ onFieldChanged }
			/>
		);
		isValid = validateFields( subject );
	}

	if ( isValid ) {
		isValid = blueprint!.valid;
	}

	return (
		<>
			{ ! editor ? (
				'Loading...'
			) : (
				<>
					<Toolbar>
						<Button
							variant="primary"
							className="button-block"
							disabled={ ! isValid }
							onClick={ async () => {
								void sendCommandToContent( {
									type: CommandTypes.SwitchToDefaultMode,
									payload: {},
								} );
								navigate(
									Screens.importWithBlueprint(
										session.id,
										blueprint!.id
									)
								);
							} }
						>
							Continue
						</Button>
					</Toolbar>
					{ editor }
				</>
			) }
		</>
	);
}

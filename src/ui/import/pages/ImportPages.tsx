import { Toolbar } from '@/ui/components/Toolbar';
import { Screens } from '@/ui/App';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentEventHandler } from '@/ui/blueprints/ContentEventHandler';
import { EventTypes } from '@/bus/Event';
import { useEffect } from 'react';
import { CommandTypes, sendCommandToContent } from '@/bus/Command';
import { SelectPages } from '@/ui/import/pages/SelectPages';
import { saveNavigationHtml } from '@/storage/navigation';

export enum Steps {
	Init = 0,
	SelectNavigation,
	SelectPagesFromNavigation,
}

export function ImportPages() {
	const params = useParams();
	const sessionId = params.sessionId!;
	const step = parseInt( params.step!, 10 );
	const navigate = useNavigate();

	// Enable or disable highlighting in source site, if step requires it.
	useEffect( () => {
		const type =
			step === Steps.SelectNavigation
				? CommandTypes.SwitchToNavigationSelectionMode
				: CommandTypes.SwitchToDefaultMode;
		void sendCommandToContent( { type, payload: {} } );
	}, [ step ] );

	// Disable highlighting on unmount.
	useEffect( () => {
		return () => {
			void sendCommandToContent( {
				type: CommandTypes.SwitchToDefaultMode,
				payload: {},
			} );
		};
	}, [] );

	let element = <></>;
	switch ( step ) {
		case Steps.Init:
			element = (
				<p>
					Navigate to a page that shows the navigation menu. Make sure
					the menu is shown on screen before clicking Continue.
				</p>
			);
			break;
		case Steps.SelectNavigation:
			element = (
				<>
					<p>Click on one of the entries of the navigation menu.</p>
					<p>
						If the menu is not shown on screen, click the Back
						button and then open the menu.
					</p>
				</>
			);
			break;
		case Steps.SelectPagesFromNavigation:
			element = <SelectPages sessionId={ sessionId } />;
			break;
		default:
			throw Error( `unknown step: ${ step }` );
	}

	return (
		<>
			<Toolbar>
				{ step === 0 ? undefined : (
					<button
						onClick={ () => {
							navigate(
								Screens.importPages( sessionId, step - 1 )
							);
						} }
					>
						Back
					</button>
				) }
				<button
					onClick={ () => {
						if ( isLastStep( step ) ) {
							console.log( 'TODO' );
						} else {
							navigate(
								Screens.importPages( sessionId, step + 1 )
							);
						}
					} }
				>
					Continue{ isLastStep( step ) ? ' (TODO)' : '' }
				</button>
			</Toolbar>
			<ContentEventHandler
				eventType={ EventTypes.OnElementClick }
				onEvent={ async ( event ) => {
					void sendCommandToContent( {
						type: CommandTypes.SwitchToDefaultMode,
						payload: {},
					} );
					await saveNavigationHtml(
						sessionId,
						( event.event.payload as any ).content
					);
					navigate( Screens.importPages( sessionId, step + 1 ) );
				} }
			/>
			{ element }
		</>
	);
}

function isLastStep( step: number ) {
	const values = Object.entries( Steps )
		.filter( ( [ , val ] ) => typeof val === 'number' )
		.map( ( [ , val ] ) => val ) as number[];
	return step === Math.max( ...values );
}

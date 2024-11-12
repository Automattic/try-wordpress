import { Toolbar } from '@/ui/components/Toolbar';
import { Screens } from '@/ui/App';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentEventHandler } from '@/ui/blueprints/ContentEventHandler';
import { EventTypes } from '@/bus/Event';
import { useEffect } from 'react';
import { CommandTypes, sendCommandToContent } from '@/bus/Command';
import { SelectPages } from '@/ui/import/pages/SelectPages';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { ImportPage } from '@/ui/import/pages/ImportPage';
import { useNavigationHtml } from '@/ui/import/pages/useNavigationHtml';
import { useSelectedPages } from '@/ui/import/pages/useSelectedPages';
import { SelectNavigation } from '@/ui/import/pages/SelectNavigation';

/* eslint-disable @typescript-eslint/no-shadow */
export enum Steps {
	Init = 0,
	SelectNavigation,
	SelectPagesFromNavigation,
	ImportPage,
}
/* eslint-enable @typescript-eslint/no-shadow */

export function ImportPagesFlow() {
	const params = useParams();
	const step = parseInt( params.step!, 10 );
	const pageIndex = parseInt( params.page! ?? 0, 10 );
	const { session } = useSessionContext();
	const navigate = useNavigate();
	const [ , setNavigationHtml ] = useNavigationHtml();
	const [ , setSelectedPages ] = useSelectedPages();

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
			element = <SelectNavigation />;
			break;
		case Steps.SelectPagesFromNavigation:
			element = <SelectPages />;
			break;
		case Steps.ImportPage:
			element = <ImportPage />;
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
								Screens.importPages( session.id, step - 1 )
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
						} else if ( step === Steps.ImportPage ) {
							navigate(
								Screens.importPages(
									session.id,
									step + 1,
									pageIndex
								)
							);
						} else {
							navigate(
								Screens.importPages( session.id, step + 1 )
							);
						}
					} }
				>
					Continue
				</button>
			</Toolbar>
			<ContentEventHandler
				eventType={ EventTypes.OnElementClick }
				onEvent={ async ( event ) => {
					void sendCommandToContent( {
						type: CommandTypes.SwitchToDefaultMode,
						payload: {},
					} );
					setNavigationHtml( ( event.event.payload as any ).content );
					setSelectedPages( undefined );
					navigate( Screens.importPages( session.id, step + 1 ) );
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

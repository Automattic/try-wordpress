import { useNavigationHtml } from '@/ui/import/pages/useNavigationHtml';
import { useSelectedPages } from '@/ui/import/pages/useSelectedPages';
import { EventTypes } from '@/bus/Event';
import { CommandTypes, sendCommandToContent } from '@/bus/Command';
import { Screens } from '@/ui/App';
import { ContentEventHandler } from '@/ui/blueprints/ContentEventHandler';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { useNavigate } from 'react-router-dom';
import { Steps } from '@/ui/import/pages/ImportPagesFlow';
import { useEffect } from 'react';
import { Toolbar } from '@/ui/import/pages/Toolbar';

// Ask the user where the navigation is and store its html in local storage.
// Once we have the navigation html, proceed to next step.
export function SelectNavigation() {
	const { session } = useSessionContext();
	const navigate = useNavigate();
	const [ , setNavigationHtml ] = useNavigationHtml();
	const [ , setSelectedPages ] = useSelectedPages();

	// Enable highlighting in source site.
	useEffect( () => {
		void sendCommandToContent( {
			type: CommandTypes.SwitchToNavigationSelectionMode,
			payload: {},
		} );
	}, [] );

	// Disable highlighting on unmount.
	useEffect( () => {
		return () => {
			void sendCommandToContent( {
				type: CommandTypes.SwitchToDefaultMode,
				payload: {},
			} );
		};
	}, [] );

	return (
		<>
			<Toolbar
				backUrl={ Screens.importPages( session.id, Steps.Init ) }
			/>
			<p>Click on one of the entries of the navigation menu.</p>
			<p>
				If the menu is not shown on screen, click the Back button and
				then open the menu.
			</p>
			<ContentEventHandler
				eventType={ EventTypes.OnElementClick }
				onEvent={ async ( event ) => {
					void sendCommandToContent( {
						type: CommandTypes.SwitchToDefaultMode,
						payload: {},
					} );
					setNavigationHtml( ( event.event.payload as any ).content );
					setSelectedPages( undefined );
					navigate(
						Screens.importPages(
							session.id,
							Steps.SelectPagesFromNavigation
						)
					);
				} }
			/>
		</>
	);
}

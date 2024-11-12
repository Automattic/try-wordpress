import { Toolbar } from '@/ui/import/pages/Toolbar';
import { Screens } from '@/ui/App';
import { useSessionContext } from '@/ui/session/SessionProvider';

export function StartPageImport() {
	const { session } = useSessionContext();
	return (
		<>
			<Toolbar
				canContinue={ true }
				backUrl={ Screens.viewSession( session.id ) }
				continueUrl={ Screens.importPagesSelectNavigation(
					session.id
				) }
			/>
			<p>Navigate to a page that shows the navigation menu.</p>
			<p>
				Make sure the menu is shown on screen before clicking Continue.
			</p>
		</>
	);
}

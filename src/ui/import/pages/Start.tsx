import { Toolbar } from '@/ui/import/pages/Toolbar';
import { Screens } from '@/ui/App';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { Steps } from '@/ui/import/pages/ImportPagesFlow';

export function Start() {
	const { session } = useSessionContext();
	return (
		<>
			<Toolbar
				canContinue={ true }
				continueUrl={ Screens.importPages(
					session.id,
					Steps.SelectNavigation
				) }
			/>
			<p>Navigate to a page that shows the navigation menu.</p>
			<p>
				Make sure the menu is shown on screen before clicking Continue.
			</p>
		</>
	);
}

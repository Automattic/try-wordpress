import { useEffect, useState } from 'react';
import { getSelectedPages } from '@/storage/selected-pages';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { Screens } from '@/ui/App';
import { Steps } from '@/ui/import/pages/ImportPagesFlow';
import { useNavigate, useParams } from 'react-router-dom';

export function ImportPage() {
	const params = useParams();
	const pageIndex = parseInt( params.page! ?? 0, 10 );
	const { session } = useSessionContext();
	const navigate = useNavigate();
	const [ url, setUrl ] = useState< string >();

	// Load url of the page to import from local storage.
	// If it's empty, redirect back to the previous step.
	useEffect( () => {
		async function loadSelectedPages() {
			const urls = await getSelectedPages( session.id );
			if (
				urls.length === 0 ||
				pageIndex + 1 > urls.length ||
				urls[ pageIndex ] === ''
			) {
				navigate(
					Screens.importPages(
						session.id,
						Steps.SelectPagesFromNavigation
					)
				);
				return;
			}
			setUrl( urls[ pageIndex ] );
		}
		loadSelectedPages().catch( console.error );
	}, [ session.id, pageIndex, navigate ] );

	return <>{ url }</>;
}

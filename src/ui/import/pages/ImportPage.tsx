import { useEffect, useState } from 'react';
import { getSelectedPages } from '@/storage/selected-pages';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { Screens } from '@/ui/App';
import { Steps } from '@/ui/import/pages/ImportPagesFlow';
import { useNavigate } from 'react-router-dom';

export function ImportPage() {
	const { session } = useSessionContext();
	const navigate = useNavigate();
	const [ urls, setUrls ] = useState< string[] >( [] );

	// Load selected pages from local storage.
	// If it's empty, redirect back to the previous step.
	useEffect( () => {
		async function loadSelectedPages() {
			const selectedUrls = await getSelectedPages( session.id );
			if ( selectedUrls.length === 0 ) {
				navigate(
					Screens.importPages(
						session.id,
						Steps.SelectPagesFromNavigation
					)
				);
				return;
			}
			setUrls( selectedUrls );
		}
		loadSelectedPages().catch( console.error );
	}, [ session.id, navigate ] );

	return <>{ urls }</>;
}

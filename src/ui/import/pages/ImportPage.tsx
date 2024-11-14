import { useEffect, useState } from 'react';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelectedPages } from '@/ui/import/pages/useSelectedPages';

// Import a specific page.
// The urls of pages to import come from local storage.
export function ImportPage() {
	const params = useParams();
	const pageIndex = parseInt( params.page! ?? 0, 10 );
	const { session } = useSessionContext();
	const navigate = useNavigate();
	const [ selectedPages ] = useSelectedPages();
	const [ url, setUrl ] = useState< string >();

	// Find the url of the page to import.
	useEffect( () => {
		if ( ! selectedPages ) {
			return;
		}
		if (
			selectedPages.length === 0 ||
			! selectedPages[ pageIndex ] ||
			selectedPages[ pageIndex ] === ''
		) {
			throw Error( `page with index ${ pageIndex } not found` );
		}
		setUrl( selectedPages[ pageIndex ] );
	}, [ session.id, pageIndex, navigate, selectedPages ] );

	return <>{ url }</>;
}

import { useEffect, useState } from 'react';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelectedPages } from '@/ui/import/pages/useSelectedPages';
import { useSubject } from '@/ui/hooks/useSubject';
import { SubjectType } from '@/model/subject/Subject';

// Import a specific page.
// The urls of pages to import come from local storage.
export function ImportPage() {
	const params = useParams();
	const pageIndex = parseInt( params.page! ?? 0, 10 );
	const { session, playgroundClient } = useSessionContext();
	const navigate = useNavigate();
	const [ selectedPages ] = useSelectedPages();
	const [ sourceUrl, setSourceUrl ] = useState< string >();
	const [ subject ] = useSubject( SubjectType.Page, sourceUrl );

	console.log( subject );

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
		setSourceUrl( selectedPages[ pageIndex ] );
	}, [ session.id, pageIndex, navigate, selectedPages ] );

	// Make playground navigate to the transformed post of the subject.
	useEffect( () => {
		if ( subject && !! playgroundClient ) {
			void playgroundClient.goTo( subject.previewUrl );
		}
	}, [ subject, playgroundClient ] );

	return <>{ sourceUrl }</>;
}

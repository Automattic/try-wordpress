import { useCallback, useEffect, useState } from 'react';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { localStorageGet, localStorageSet } from '@/browser';

// Store and get selected pages from local storage.
export function useSelectedPages(): [
	string[] | undefined,
	( urls: string[] | undefined ) => void,
] {
	const { session } = useSessionContext();
	const [ urls, setUrls ] = useState< string[] >();

	// Load from local storage.
	useEffect( () => {
		getSelectedPages( session.id ).then( setUrls ).catch( console.error );
	}, [ session.id ] );

	// Save to local storage.
	const setSelectedPages = useCallback(
		( values: string[] | undefined ) => {
			setUrls( values );
			saveSelectedPages( session.id, values ?? [] ).catch(
				console.error
			);
		},
		[ session.id ]
	);

	return [ urls, setSelectedPages ];
}

async function saveSelectedPages(
	sessionId: string,
	urls: string[]
): Promise< void > {
	const values: Record< string, string[] > = {};
	values[ key( sessionId ) ] = urls;
	return localStorageSet( values );
}

async function getSelectedPages( sessionId: string ): Promise< string[] > {
	const values = await localStorageGet( key( sessionId ) );
	if ( ! values || ! values[ key( sessionId ) ] ) {
		return [];
	}
	return values[ key( sessionId ) ] as string[];
}

function key( sessionId: string ): string {
	return `selected-pages-${ sessionId }`;
}

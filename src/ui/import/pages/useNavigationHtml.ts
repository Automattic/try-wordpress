import { useCallback, useEffect, useState } from 'react';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { localStorageGet, localStorageSet } from '@/browser';

// Store and get navigation html from local storage.
export function useNavigationHtml(): [
	string | undefined,
	( html: string ) => void,
] {
	const { session } = useSessionContext();
	const [ html, setHtml ] = useState< string >();

	// Load from local storage.
	useEffect( () => {
		getNavigationHtml( session.id ).then( setHtml ).catch( console.error );
	}, [ session.id ] );

	// Save to local storage.
	const setNavigationHtml = useCallback(
		( value: string ) => {
			setHtml( value );
			saveNavigationHtml( session.id, value ).catch( console.error );
		},
		[ session.id ]
	);

	return [ html, setNavigationHtml ];
}

async function saveNavigationHtml(
	sessionId: string,
	html: string
): Promise< void > {
	const values: Record< string, string > = {};
	values[ key( sessionId ) ] = html;
	return localStorageSet( values );
}

async function getNavigationHtml( sessionId: string ): Promise< string > {
	const values = await localStorageGet( key( sessionId ) );
	if ( ! values || ! values[ key( sessionId ) ] ) {
		return '';
	}
	return values[ key( sessionId ) ] as string;
}

function key( sessionId: string ): string {
	return `navigation-${ sessionId }`;
}

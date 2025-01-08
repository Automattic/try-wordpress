import { useEffect, useRef } from 'react';
import { PlaygroundClient } from '@wp-playground/client';
import { initPlayground } from '@/remote/playground/playground';

const playgroundIframeId = 'playground';

export function Playground( props: {
	slug: string;
	className?: string;
	blogName: string;
	onReady: ( client: PlaygroundClient ) => void;
} ) {
	const { slug, className, blogName, onReady } = props;
	const initializationRef = useRef( false );

	useEffect( () => {
		const iframe = document.getElementById( playgroundIframeId );
		if ( ! ( iframe instanceof HTMLIFrameElement ) ) {
			throw Error( 'Playground container element must be an iframe' );
		}
		if ( iframe.src !== '' || initializationRef.current ) {
			// Playground is already started or initialization has been attempted.
			return;
		}

		initializationRef.current = true;

		initPlayground( iframe, slug, blogName )
			.then( async ( client: PlaygroundClient ) => {
				const url = await client.absoluteUrl;
				console.log( 'Playground communication established', url );
				onReady( client );
			} )
			.catch( ( error ) => {
				throw error;
			} );
	}, [ slug, blogName, onReady ] );

	return (
		<iframe
			title={ slug }
			id={ playgroundIframeId }
			className={ className }
		/>
	);
}

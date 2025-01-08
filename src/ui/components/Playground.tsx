import { useEffect, useRef } from 'react';
import { PlaygroundClient } from '@wp-playground/client';
import { mountPlayground } from '@/remote/playground/playground';

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
		if ( initializationRef.current ) {
			// Playground is already started or initialization has been attempted.
			return;
		}
		initializationRef.current = true;
		mountPlayground( playgroundIframeId, slug, blogName ).then( onReady );
	}, [ slug, blogName, onReady ] );

	return (
		<iframe
			title={ slug }
			id={ playgroundIframeId }
			className={ className }
		/>
	);
}

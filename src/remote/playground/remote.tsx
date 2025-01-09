import {
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { Session } from '@/storage/session';
import { PlaygroundClient } from '@wp-playground/client';
import { ApiClient } from '@/remote/api/ApiClient';
import { mountPlayground } from '@/remote/playground/playground';

export interface PlaygroundRemote {
	front: ReactNode;
	admin: ReactNode;
	isReady: boolean;
	api?: ApiClient;
	client?: PlaygroundClient;
}

export function usePlaygroundRemote( props: {
	session: Session | undefined;
} ): PlaygroundRemote | undefined {
	const { session } = props;
	const [ client, setClient ] = useState< PlaygroundClient >();
	const [ api, setApi ] = useState< ApiClient >();
	const [ isReady, setIsReady ] = useState( false );
	const booted = useRef( false );

	const iframeId = useCallback(
		() => ( ! session?.id ? '' : `playground-${ session.id }` ),
		[ session ]
	);

	useEffect( () => {
		if ( ! session || session.id === '' ) {
			booted.current = false;
			return;
		}
		if ( booted.current ) {
			// Playground is already started or initialization has been attempted.
			return;
		}
		booted.current = true;
		mountPlayground( iframeId(), session.id, session.title ).then(
			async ( c ) => {
				// Because client is "function-y", we need to wrap it in a function so that React doesn't call it.
				// See: https://react.dev/reference/react/useState#im-trying-to-set-state-to-a-function-but-it-gets-called-instead.
				setClient( () => c );
				setApi( new ApiClient( c, await c.absoluteUrl ) );
				setIsReady( true );
			}
		);
	}, [ session, iframeId ] );

	const front = useMemo< ReactNode >( () => {
		return ! session || session.id === '' ? undefined : (
			<iframe title={ iframeId() } id={ iframeId() } />
		);
	}, [ session, iframeId ] );

	return useMemo< PlaygroundRemote | undefined >( () => {
		if ( ! session || session.id === '' ) {
			return undefined;
		}
		const admin = ! isReady ? undefined : (
			<iframe
				title={ `${ iframeId() }-admin` }
				src={ `${ api!.siteUrl }/wp-admin/` }
			/>
		);
		return {
			front,
			admin,
			isReady,
			api,
			client,
		};
	}, [ session, iframeId, front, isReady, api, client ] );
}

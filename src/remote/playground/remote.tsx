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
import { Api } from '@/remote/api/Api';
import { mountPlayground } from '@/remote/playground/playground';

export interface PlaygroundRemote {
	front: ReactNode;
	admin: ReactNode;
	isReady: boolean;
	baseUrl?: string;
	api?: Api;
	client?: PlaygroundClient;
}

export function usePlaygroundRemote( props: {
	session: Session | undefined;
} ): PlaygroundRemote | undefined {
	const { session } = props;
	const [ baseUrl, setBaseUrl ] = useState< string >();
	const [ client, setClient ] = useState< PlaygroundClient >();
	const [ api, setApi ] = useState< Api >();
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
				setBaseUrl( await c.absoluteUrl );
				setClient( () => c );
				setApi( new Api( c ) );
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
			// We must only return undefined when the session is undefined.
			// Do not add any extra conditions to the above if statement.
			return undefined;
		}
		const admin =
			! isReady || ! baseUrl ? undefined : (
				<iframe
					title={ `${ iframeId() }-admin` }
					src={ `${ baseUrl }/wp-admin/` }
				/>
			);
		return {
			front,
			admin,
			isReady,
			baseUrl,
			api,
			client,
		};
	}, [ session, iframeId, front, isReady, baseUrl, api, client ] );
}

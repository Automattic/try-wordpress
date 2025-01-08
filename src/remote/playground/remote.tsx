import { ReactNode, useMemo, useState } from 'react';
import { Session } from '@/storage/session';
import { Playground } from '@/ui/components/Playground';
import { PlaygroundClient } from '@wp-playground/client';
import { ApiClient } from '@/api/ApiClient';

export interface PlaygroundRemote {
	front: ReactNode;
	admin: ReactNode;
	isReady: boolean;
	api?: ApiClient;
	client?: PlaygroundClient;
}

export function usePlaygroundRemote( props: {
	session: Session | undefined;
} ): PlaygroundRemote {
	const { session } = props;
	const [ client, setClient ] = useState< PlaygroundClient >();
	const [ api, setApi ] = useState< ApiClient >();
	const [ isReady, setIsReady ] = useState( false );

	const front = useMemo< ReactNode >( () => {
		if ( ! session || session.id === '' ) {
			return undefined;
		}
		return (
			<Playground
				slug={ session.id }
				blogName={ session.title }
				onReady={ async ( c ) => {
					// Because client is "function-y", we need to wrap it in a function so that React doesn't call it.
					// See: https://react.dev/reference/react/useState#im-trying-to-set-state-to-a-function-but-it-gets-called-instead.
					setClient( () => c );
					setApi( new ApiClient( c, await c.absoluteUrl ) );
					setIsReady( true );
				} }
			/>
		);
	}, [ session ] );

	const admin = useMemo< ReactNode >( () => {
		if ( ! isReady ) {
			return undefined;
		}
		return (
			<iframe
				title={ `${ session!.id }-admin` }
				src={ `${ api!.siteUrl }/wp-admin/` }
			/>
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isReady ] );

	return { front, admin, isReady, client, api };
}

import {
	MountDescriptor,
	PlaygroundClient,
	StartPlaygroundOptions,
	startPlaygroundWeb,
} from '@wp-playground/client';
import { isOpfsEnabled } from '@/config';
import { localStorageGet, localStorageSet } from '@/browser';
import { blueprint } from '@/remote/playground/blueprint';

export async function mountPlayground(
	playgroundIframeId: string,
	slug: string,
	blogName: string
): Promise< PlaygroundClient > {
	const iframe = document.getElementById( playgroundIframeId );
	if ( ! ( iframe instanceof HTMLIFrameElement ) ) {
		throw Error( 'Playground container element must be an iframe' );
	}
	if ( iframe.src !== '' ) {
		throw Error( 'Attempting to mount Playground into a non-empty iframe' );
	}

	const client = await initPlayground( iframe, slug, blogName );
	const url = await client.absoluteUrl;
	console.log( 'Playground communication established', url );

	return client;
}

async function initPlayground(
	iframe: HTMLIFrameElement,
	slug: string,
	blogName: string
): Promise< PlaygroundClient > {
	const opfsEnabled = isOpfsEnabled();

	// TODO: We should pass the initialSyncDirection property.
	// @ts-ignore
	const mountDescriptor: MountDescriptor = {
		device: {
			type: 'opfs',
			path: '/try-wp-sites/' + slug,
		},
		mountpoint: '/wordpress',
	};

	const isWPInstalled = await isWordPressInstalled( slug );
	console.info(
		'opfsEnabled:',
		opfsEnabled,
		'isWordPressInstalled:',
		isWPInstalled
	);

	const options: StartPlaygroundOptions = {
		iframe,
		remoteUrl: `https://pg.ashfame.com/remote.html`,
		mounts: opfsEnabled ? [ mountDescriptor ] : undefined,
		shouldInstallWordPress: opfsEnabled ? ! isWPInstalled : undefined,
		blueprint: blueprint( blogName ),
	};

	const client: PlaygroundClient = await startPlaygroundWeb( options );
	await client.isReady();

	if ( ! isWPInstalled ) {
		await setWordPressAsInstalled( slug );
	}

	return client;
}

async function isWordPressInstalled( slug: string ) {
	const localStorageKey = `${ slug }-isWordPressInstalled`;
	let isInstalled = false;

	try {
		const result = await localStorageGet( localStorageKey );
		if ( result[ localStorageKey ] === 'true' ) {
			isInstalled = true;
		}
		return isInstalled;
	} catch ( error ) {
		console.log( `Error: ${ error }` );
		return false; // In case of error, assume WordPress is not installed
	}
}

async function setWordPressAsInstalled( slug: string ) {
	const localStorageKey = `${ slug }-isWordPressInstalled`;
	await localStorageSet( { [ localStorageKey ]: 'true' } );
}

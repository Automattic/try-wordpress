import { localStorageGet, localStorageSet } from '@/browser';

export interface Config {
	currentPath: string;
}

export async function setConfig( value: Config ): Promise< void > {
	const config = await getConfig();
	let key: keyof Config;
	for ( key in value ) {
		config[ key ] = value[ key ];
	}
	return localStorageSet( { config } );
}

export async function getConfig(): Promise< Config > {
	const values = await localStorageGet( 'config' );
	if ( ! values || ! values.config ) {
		return { currentPath: '/' };
	}
	return values.config as Config;
}

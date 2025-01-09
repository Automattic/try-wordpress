import { Adapter } from '@/remote/api/client/Client';
import { PlaygroundClient } from '@wp-playground/client';
import { HttpProxy } from '@/remote/playground/HttpProxy';

export class PlaygroundAdapter implements Adapter {
	private playgroundClient: HttpProxy;
	constructor( playgroundClient: PlaygroundClient ) {
		this.playgroundClient = new HttpProxy( playgroundClient );
	}

	async get( url: string ): Promise< object | null > {
		const response = await this.playgroundClient.request( {
			url,
			method: 'GET',
		} );
		if ( response.httpStatusCode === 404 ) {
			return null;
		}
		if ( response.httpStatusCode < 200 || response.httpStatusCode >= 300 ) {
			throw Error( response.json.message );
		}
		return response.json;
	}

	async post( url: string, body: object ): Promise< object > {
		const response = await this.playgroundClient.request( {
			url,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify( body ),
		} );
		if ( response.httpStatusCode < 200 || response.httpStatusCode >= 300 ) {
			throw Error( response.json.message );
		}
		return response.json;
	}
}

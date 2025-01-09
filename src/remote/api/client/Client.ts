import { PlaygroundClient } from '@wp-playground/client';
import { HttpProxy } from '@/remote/playground/HttpProxy';

export class Client {
	private readonly client: HttpProxy;

	constructor( private readonly playgroundClient: PlaygroundClient ) {
		this.client = new HttpProxy( playgroundClient );
	}

	async get(
		route: string,
		params?: Record< string, string >
	): Promise< object | null > {
		let url = `/index.php?rest_route=/try-wp/v1${ route }`;
		for ( const name in params ) {
			const encoded = encodeURIComponent( params[ name ] );
			url += `&${ name }=${ encoded }`;
		}
		const response = await this.client.request( {
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

	async post( route: string, body: object ): Promise< object > {
		const url = `/index.php?rest_route=/try-wp/v1${ route }`;
		const response = await this.client.request( {
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

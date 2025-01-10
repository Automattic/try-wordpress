import { Adapter } from '@/remote/api/client/Client';
import {
	PHPRequest,
	PHPResponse,
	PlaygroundClient,
} from '@wp-playground/client';
import { shouldLogApiRequests } from '@/config';

export class PlaygroundAdapter implements Adapter {
	constructor( private readonly playgroundClient: PlaygroundClient ) {}

	async get( url: string ): Promise< object | null > {
		const request: PHPRequest = {
			url,
			method: 'GET',
		};
		const response = await this.playgroundClient.request( request );
		if ( shouldLogApiRequests() ) {
			logRequest( { request, response } );
		}
		if ( response.httpStatusCode === 404 ) {
			return null;
		}
		if ( response.httpStatusCode < 200 || response.httpStatusCode >= 300 ) {
			logFailedRequest( { request, response } );
			throw Error( response.json.message );
		}
		return response.json;
	}

	async post( url: string, body: object ): Promise< object > {
		const request: PHPRequest = {
			url,
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( body ),
		};
		const response = await this.playgroundClient.request( request );
		if ( shouldLogApiRequests() ) {
			logRequest( { request, response } );
		}
		if ( response.httpStatusCode < 200 || response.httpStatusCode >= 300 ) {
			logFailedRequest( { request, response } );
			throw Error( response.json.message );
		}
		return response.json;
	}
}

function logRequest( args: { request: PHPRequest; response: PHPResponse } ) {
	const { request, response } = args;
	const url = request.url;
	console.log( {
		type: 'API Request/Response',
		request: {
			url,
			body:
				typeof request.body === 'string'
					? ( () => {
							try {
								return JSON.parse( request.body );
							} catch {
								return request.body;
							}
					  } )()
					: request.body,
		},
		response: { status: response.httpStatusCode, body: response.json },
	} );
}

function logFailedRequest( args: {
	request: PHPRequest;
	response: PHPResponse;
} ) {
	const { request, response } = args;
	const url = request.url;
	const params = request.body;
	const message = `Request to ${ url } failed [${ response.httpStatusCode }]`;
	if ( params ) {
		console.error( message, params, response.json, response );
	} else {
		console.error( message, response.json, response );
	}
}

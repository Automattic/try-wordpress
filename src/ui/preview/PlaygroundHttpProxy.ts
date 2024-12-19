import {
	PHPRequest,
	PHPResponse,
	PlaygroundClient,
} from '@wp-playground/client';

export class PlaygroundHttpProxy {
	constructor( private readonly client: PlaygroundClient ) {}

	async request( request: PHPRequest ): Promise< PHPResponse > {
		const response = await this.client.request( request );

		if ( response.httpStatusCode < 200 || response.httpStatusCode >= 300 ) {
			logFailedRequest( { request, response } );
		}

		return response;
	}
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

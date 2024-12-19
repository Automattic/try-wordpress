import { PHPRequest, PlaygroundClient } from '@wp-playground/client';

export class PlaygroundHttpProxy {
	constructor( private readonly client: PlaygroundClient ) {}

	async request( request: PHPRequest ) {
		return await this.client.request( request );
	}
}

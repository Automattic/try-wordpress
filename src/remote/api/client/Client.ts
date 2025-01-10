export interface Adapter {
	get: ( url: string ) => object | null;
	post: ( url: string, body: object ) => object;
}

export class Client {
	constructor( private readonly adapter: Adapter ) {}

	async get(
		route: string,
		params?: Record< string, string >
	): Promise< object | null > {
		let url = `/index.php?rest_route=/try-wp/v1${ route }`;
		for ( const name in params ) {
			const encoded = encodeURIComponent( params[ name ] );
			url += `&${ name }=${ encoded }`;
		}
		return this.adapter.get( url );
	}

	async post( route: string, body: object ): Promise< object > {
		const url = `/index.php?rest_route=/try-wp/v1${ route }`;
		return this.adapter.post( url, body );
	}
}

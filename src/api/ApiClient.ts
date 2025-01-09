import { PlaygroundClient } from '@wp-playground/client';
import { SettingsApi } from '@/api/Settings';
import { UsersApi } from '@/api/Users';
import { SubjectsApi } from '@/api/SubjectsApi';
import { HttpProxy } from '@/remote/playground/HttpProxy';

export class ApiClient {
	private readonly _client: HttpProxy;
	private readonly _siteUrl: string;
	private readonly _subjects: SubjectsApi;
	private readonly _settings: SettingsApi;
	private readonly _users: UsersApi;

	constructor( playgroundClient: PlaygroundClient, siteUrl: string ) {
		this._client = new HttpProxy( playgroundClient );
		this._siteUrl = siteUrl;
		this._subjects = new SubjectsApi( this );
		this._settings = new SettingsApi( this );
		this._users = new UsersApi( this );
	}

	get siteUrl(): string {
		return this._siteUrl;
	}

	get subjects(): SubjectsApi {
		return this._subjects;
	}

	get settings(): SettingsApi {
		return this._settings;
	}

	get users(): UsersApi {
		return this._users;
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
		const response = await this._client.request( {
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
		const response = await this._client.request( {
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

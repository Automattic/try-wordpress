import { Client } from '@/remote/api/client/Client';
import { SettingsApi } from '@/remote/api/Settings';
import { UsersApi } from '@/remote/api/Users';
import { SubjectsApi } from '@/remote/api/SubjectsApi';

export class Api {
	private readonly _subjects: SubjectsApi;
	private readonly _settings: SettingsApi;
	private readonly _users: UsersApi;

	constructor( client: Client ) {
		this._subjects = new SubjectsApi( client );
		this._settings = new SettingsApi( client );
		this._users = new UsersApi( client );
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
}

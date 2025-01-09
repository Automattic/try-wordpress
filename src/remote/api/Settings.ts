import { Api } from '@/remote/api/Api';
import { SiteSettings } from '@/model/SiteSettings';
import { ApiSettings } from '@/remote/api/client';

interface UpdateBody {
	title?: string;
}

export class SettingsApi {
	// eslint-disable-next-line no-useless-constructor
	constructor( private readonly api: Api ) {}

	async update( body: UpdateBody ): Promise< SiteSettings > {
		const actualBody: any = {};
		if ( body.title ) {
			actualBody.title = body.title;
		}
		if ( Object.keys( actualBody ).length === 0 ) {
			throw Error( 'attempting to update zero fields' );
		}
		const response = ( await this.api.post(
			`/settings`,
			actualBody
		) ) as ApiSettings;
		return makeSiteSettingsFromApiResponse( response );
	}
}

function makeSiteSettingsFromApiResponse(
	response: ApiSettings
): SiteSettings {
	return {
		title: response.title,
	};
}

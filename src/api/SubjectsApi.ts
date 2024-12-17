import { ApiClient } from '@/api/ApiClient';
import { Subject, SubjectType } from '@/model/Subject';
import { ApiPost } from '@/api/ApiTypes';
import { newDateField } from '@/model/field/DateField';
import { newTextField } from '@/model/field/TextField';
import { newHtmlField } from '@/model/field/HtmlField';
import { getSchema } from '@/model/Schema';

export class SubjectsApi {
	constructor( private readonly client: ApiClient ) {}

	async create( type: SubjectType, sourceUrl: string ): Promise< Subject > {
		const path = getEndpoint( type );
		const response = ( await this.client.post( path, {
			sourceUrl,
		} ) ) as ApiPost;
		return fromApiResponse( type, response );
	}

	async update( subject: Subject ): Promise< Subject > {
		const { id, type } = subject;
		const path = `${ getEndpoint( type ) }/${ id }`;
		const response = ( await this.client.post(
			path,
			toApiUpdateRequest( subject )
		) ) as ApiPost;
		return fromApiResponse( type, response );
	}

	async findById( type: SubjectType, id: number ): Promise< Subject | null > {
		const path = `${ getEndpoint( type ) }/${ id }`;
		const post = ( await this.client.get( path ) ) as ApiPost;
		return post ? fromApiResponse( type, post ) : null;
	}

	async findBySourceUrl(
		type: SubjectType,
		sourceUrl: string
	): Promise< Subject | null > {
		const path = `${ getEndpoint( type ) }?sourceurl=${ sourceUrl }`;
		const post = ( await this.client.get( path ) ) as ApiPost;
		return post ? fromApiResponse( type, post ) : null;
	}
}

function getEndpoint( type: SubjectType ): string {
	const schema = getSchema( type );
	return `/subjects/${ schema.slug }`;
}

function fromApiResponse( type: SubjectType, response: ApiPost ): Subject {
	const date = newDateField( response.rawDate, response.parsedDate );
	const title = newTextField( response.rawTitle, response.parsedTitle ?? '' );
	const content = newHtmlField(
		response.rawContent,
		response.parsedContent ?? ''
	);

	return {
		id: response.id,
		type,
		sourceUrl: response.sourceUrl,
		transformedId: response.transformedId,
		previewUrl: response.previewUrl,
		fields: {
			title,
			date,
			content,
		},
	};
}

type UpdateBody = Omit< ApiPost, 'sourceUrl' | 'transformedId' | 'previewUrl' >;

function toApiUpdateRequest( subject: Subject ): UpdateBody {
	let request: UpdateBody = {
		id: subject.id,
	};

	Object.entries( subject.fields ).forEach( ( [ fieldName, field ] ) => {
		const capitalizedFieldName =
			fieldName.charAt( 0 ).toUpperCase() + fieldName.slice( 1 );

		let parsedValue = field.parsedValue;
		// Handle special cases
		if ( fieldName === 'date' && field.parsedValue instanceof Date ) {
			parsedValue = field.parsedValue.toISOString();
		}

		request = {
			...request,
			[ `raw${ capitalizedFieldName }` ]: field.rawValue,
			[ `parsed${ capitalizedFieldName }` ]: parsedValue,
		};
	} );

	return request;
}

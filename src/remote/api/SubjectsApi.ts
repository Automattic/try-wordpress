import { Api } from '@/remote/api/Api';
import { Subject, SubjectType } from '@/model/Subject';
import { ApiPost } from '@/remote/api/ApiTypes';
import { getSchema } from '@/model/Schema';
import { Field, FieldType } from '@/model/field/Field';
import { newDateField } from '@/model/field/DateField';
import { newTextField } from '@/model/field/TextField';
import { newHtmlField } from '@/model/field/HtmlField';

export class SubjectsApi {
	constructor( private readonly api: Api ) {}

	async create( type: SubjectType, sourceUrl: string ): Promise< Subject > {
		const path = getEndpoint( type );
		const response = ( await this.api.post( path, {
			sourceUrl,
		} ) ) as ApiPost;
		return fromApiResponse( type, response );
	}

	async update( subject: Subject ): Promise< Subject > {
		const { id, type } = subject;
		const path = `${ getEndpoint( type ) }/${ id }`;
		const response = ( await this.api.post(
			path,
			toApiUpdateRequest( subject )
		) ) as ApiPost;
		return fromApiResponse( type, response );
	}

	async findById( type: SubjectType, id: number ): Promise< Subject | null > {
		const path = `${ getEndpoint( type ) }/${ id }`;
		const post = ( await this.api.get( path ) ) as ApiPost;
		return post ? fromApiResponse( type, post ) : null;
	}

	async findBySourceUrl(
		type: SubjectType,
		sourceUrl: string
	): Promise< Subject | null > {
		const path = `${ getEndpoint( type ) }&sourceurl=${ encodeURIComponent(
			sourceUrl
		) }`;
		const post = ( await this.api.get( path ) ) as ApiPost;
		return post ? fromApiResponse( type, post ) : null;
	}
}

function getEndpoint( type: SubjectType ): string {
	const schema = getSchema( type );
	return `/subjects/${ schema.slug }`;
}

function fromApiResponse( type: SubjectType, response: ApiPost ): Subject {
	const schema = getSchema( type );

	const fields = Object.entries( schema.fields ).reduce<
		Record< string, Field >
	>( ( acc, [ fieldName, schemaField ] ) => {
		// Create the raw/parsed key names from the field name
		const rawKey = `raw${ fieldName
			.charAt( 0 )
			.toUpperCase() }${ fieldName.slice( 1 ) }`;
		const parsedKey = `parsed${ fieldName
			.charAt( 0 )
			.toUpperCase() }${ fieldName.slice( 1 ) }`;

		// Get values from response
		const rawValue = response[ rawKey ];
		const parsedValue = response[ parsedKey ];

		// Create field based on schema-defined type
		switch ( schemaField.type ) {
			case FieldType.Date:
				acc[ fieldName ] = newDateField( rawValue, parsedValue );
				break;
			case FieldType.Text:
				acc[ fieldName ] = newTextField( rawValue, parsedValue );
				break;
			case FieldType.Html:
				acc[ fieldName ] = newHtmlField( rawValue, parsedValue );
				break;
		}

		return acc;
	}, {} );

	return {
		id: response.id,
		type,
		sourceUrl: response.sourceUrl,
		transformedId: response.transformedId,
		previewUrl: response.previewUrl,
		fields,
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

		if (
			field.type === FieldType.Date &&
			field.parsedValue instanceof Date
		) {
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

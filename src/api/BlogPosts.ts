import { BlogPost } from '@/model/subject/BlogPost';
import { ApiClient } from '@/api/ApiClient';
import { SubjectType } from '@/model/subject/Subject';
import { newDateField } from '@/model/field/DateField';
import { newTextField } from '@/model/field/TextField';
import { newHtmlField } from '@/model/field/HtmlField';
import { ApiPost } from '@/api/ApiTypes';

export class BlogPostsApi {
	// eslint-disable-next-line no-useless-constructor
	constructor( private readonly client: ApiClient ) {}

	async create( blogPost: BlogPost ): Promise< BlogPost > {
		const response = ( await this.client.post( '/blog-posts', {
			sourceUrl: blogPost.sourceUrl,
		} ) ) as ApiPost;
		return fromApiResponse( response );
	}

	async update( id: number, post: BlogPost ): Promise< BlogPost > {
		const response = ( await this.client.post(
			`/blog-posts/${ id }`,
			toApiRequest( post )
		) ) as ApiPost;
		return fromApiResponse( response );
	}

	async findById( id: string ): Promise< BlogPost | null > {
		const post = ( await this.client.get(
			'/blog-posts/' + id
		) ) as ApiPost;
		return post ? fromApiResponse( post ) : null;
	}

	async findBySourceUrl( sourceUrl: string ): Promise< BlogPost | null > {
		const post = ( await this.client.get(
			'/blog-posts?sourceurl=' + sourceUrl
		) ) as ApiPost;
		return post ? fromApiResponse( post ) : null;
	}
}

function fromApiResponse( response: ApiPost ): BlogPost {
	const date = newDateField( response.rawDate, response.parsedDate );
	const title = newTextField( response.rawTitle, response.parsedTitle ?? '' );
	const content = newHtmlField(
		response.rawContent,
		response.parsedContent ?? ''
	);

	return {
		id: response.id,
		type: SubjectType.BlogPost,
		sourceUrl: response.sourceUrl,
		transformedId: response.transformedId,
		previewUrl: response.previewUrl,
		title,
		date,
		content,
	};
}

function toApiRequest( post: BlogPost ): ApiPost {
	return {
		id: post.id,
		// read-only from api perspective, so including it has no effect
		transformedId: post.transformedId,
		// update not allowed so will be a bad request if you try to do it
		sourceUrl: post.sourceUrl,
		// read-only from api perspective, so including it has no effect
		previewUrl: post.previewUrl,
		rawDate: post.date.rawValue,
		parsedDate: post.date.parsedValue.toISOString(),
		rawTitle: post.title.rawValue,
		parsedTitle: post.title.parsedValue,
		rawContent: post.content.rawValue,
		parsedContent: post.content.parsedValue,
	};
}

export async function saveNavigationHtml(
	sessionId: string,
	html: string
): Promise< void > {
	const values: Record< string, string > = {};
	values[ key( sessionId ) ] = html;
	return browser.storage.local.set( values );
}

export async function getNavigationHtml(
	sessionId: string
): Promise< string > {
	const values = await browser.storage.local.get( key( sessionId ) );
	if ( ! values || ! values[ key( sessionId ) ] ) {
		return '';
	}
	return values[ key( sessionId ) ] as string;
}

function key( sessionId: string ): string {
	return `navigation-${ sessionId }`;
}

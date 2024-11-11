export async function saveSelectedPages(
	sessionId: string,
	urls: string[]
): Promise< void > {
	const values: Record< string, string[] > = {};
	values[ key( sessionId ) ] = urls;
	return browser.storage.local.set( values );
}

export async function getSelectedPages(
	sessionId: string
): Promise< string[] > {
	const values = await browser.storage.local.get( key( sessionId ) );
	if ( ! values || ! values[ key( sessionId ) ] ) {
		return [];
	}
	return values[ key( sessionId ) ] as string[];
}

function key( sessionId: string ): string {
	return `selected-pages-${ sessionId }`;
}

export async function saveNavigationHtml(
	sessionId: string,
	html: string
): Promise< void > {
	const values: Record< string, string > = {};
	values[ navigationKey( sessionId ) ] = html;
	return browser.storage.local.set( values );
}

export async function getNavigationHtml(
	sessionId: string
): Promise< string > {
	const values = await browser.storage.local.get(
		navigationKey( sessionId )
	);
	if ( ! values || ! values[ navigationKey( sessionId ) ] ) {
		return '';
	}
	return values[ navigationKey( sessionId ) ] as string;
}

function navigationKey( sessionId: string ): string {
	return `navigation-${ sessionId }`;
}

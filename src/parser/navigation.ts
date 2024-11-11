import { findDeepestChild } from '@/parser/util';
import { LinkField, newLinkField } from '@/model/field/LinkField';

// Parse a <ul> or <ol> containing an anchor element per li element into link fields.
export function parseNavigationHtml( html: string ): LinkField[] {
	if ( html === '' ) {
		return [];
	}

	const container = document.createElement( 'ul' );
	container.innerHTML = html.trim();
	const liElements = container.querySelectorAll( 'li' ).values().toArray();

	const anchors: HTMLAnchorElement[] = liElements
		.map( ( element ) => {
			const anchorElement = findDeepestChild( element.innerHTML );
			if (
				anchorElement &&
				anchorElement.tagName.toLowerCase() === 'a'
			) {
				return anchorElement as HTMLAnchorElement;
			}
			return undefined;
		} )
		.filter( ( link ) => !! link );

	return anchors.map( ( anchor ) => {
		return newLinkField( anchor.outerHTML, anchor.text, anchor.href );
	} );
}

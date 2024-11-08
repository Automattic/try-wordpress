import { pasteHandler, serialize } from '@wordpress/blocks';
import { findDeepestChild } from '@/parser/util';
import { newTextField, TextField } from '@/model/field/TextField';
import { HtmlField, newHtmlField } from '@/model/field/HtmlField';
import { Field } from '@/model/field/Field';
import { DateField, newDateField } from '@/model/field/DateField';

export function parsePageField( name: string, field: Field ): Field {
	switch ( name ) {
		case 'date':
			return parsePageDate( field.rawValue );
		case 'title':
			return parsePageTitle( field.rawValue );
		case 'content':
			return parsePageContent( field.rawValue );
		default:
			throw Error( `unknown field type ${ field.type }` );
	}
}

export function parsePageDate( html: string ): DateField {
	const container = document.createElement( 'div' );
	container.innerHTML = html.trim();
	const element = container.querySelector( 'time' );
	return newDateField( html, element ? element.dateTime : '' );
}

export function parsePageTitle( html: string ): TextField {
	const deepestChild = findDeepestChild( html );
	return newTextField( html, deepestChild?.innerHTML ?? '' );
}

export function parsePageContent( html: string ): HtmlField {
	return newHtmlField( html, serializeBlocks( html ) );
}

function serializeBlocks( html: string ): string {
	const blocks = pasteHandler( {
		mode: 'BLOCKS',
		HTML: html,
	} );
	return serialize( blocks );
}

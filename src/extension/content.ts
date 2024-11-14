import { startListening } from '@/bus/Bus';
import { CommandTypes } from '@/bus/Command';
import { EventTypes, sendEventToApp } from '@/bus/Event';

enum Modes {
	// Default mode, nothing is happening.
	Default = 0,
	// Generic element selection mode.
	GenericSelection,
	// Selection mode specific to navigation.
	NavigationSelection,
}

let currentMode = Modes.Default;

startListening( CommandTypes.GetCurrentPageInfo, ( event ) => {
	event.sendResponse( {
		url: document.documentURI,
		title: document.title,
	} );
} );

startListening( CommandTypes.NavigateTo, ( event ) => {
	const url = ( event.event.payload as any ).url;
	if ( document.location.href !== url ) {
		document.location.href = url;
	}
} );

startListening( CommandTypes.SwitchToNavigationSelectionMode, () => {
	currentMode = Modes.NavigationSelection;
	enableHighlighting();
} );

startListening( CommandTypes.SwitchToGenericSelectionMode, () => {
	currentMode = Modes.GenericSelection;
	enableHighlighting();
} );

startListening( CommandTypes.SwitchToDefaultMode, () => {
	currentMode = Modes.Default;
	disableHighlighting();
} );

function onClick( event: MouseEvent ) {
	event.preventDefault();
	const element = event.target as HTMLElement;
	if ( ! element ) {
		return;
	}

	let content = '';
	switch ( currentMode ) {
		case Modes.GenericSelection:
			const clone = element.cloneNode( true ) as HTMLElement;
			clone.style.outline = '';
			content = clone.outerHTML.trim();
			break;
		case Modes.NavigationSelection:
			// The user should have clicked on one of the navigation entries.
			// Look for the parent ul or ol.
			let navigationContainer;
			let currentElement: HTMLElement | null = element;
			while ( currentElement ) {
				if ( currentElement.tagName.toLowerCase() === 'li' ) {
					navigationContainer = currentElement.parentElement;
					break;
				}
				currentElement = currentElement.parentElement;
			}
			content = navigationContainer ? navigationContainer.innerHTML : '';
			break;
		default:
			throw Error( `unknown mode ${ currentMode }` );
	}

	content = content.replaceAll( ' style=""', '' );
	void sendEventToApp( {
		type: EventTypes.OnElementClick,
		payload: { content },
	} );
}

let highlightedElement: HTMLElement | null = null;

function onMouseOver( event: MouseEvent ) {
	const element = event.target as HTMLElement | null;
	if ( ! element ) {
		return;
	}
	highlightedElement = element;
	highlightedElement.style.outline = '1px solid blue';
}

function onMouseOut( event: MouseEvent ) {
	const element = event.target as HTMLElement | null;
	if ( ! element ) {
		return;
	}
	removeStyle();
	highlightedElement = null;
}

const cursorStyleId = 'hover-highlighter-style';

function enableHighlighting() {
	document.body.addEventListener( 'mouseover', onMouseOver );
	document.body.addEventListener( 'mouseout', onMouseOut );
	document.body.addEventListener( 'click', onClick );

	let style = document.getElementById( cursorStyleId );
	if ( style ) {
		// The highlighting cursor is already enabled.
		return;
	}
	style = document.createElement( 'style' );
	style.id = cursorStyleId;
	style.textContent = '* { cursor: crosshair !important; }';
	document.head.append( style );
}

function disableHighlighting() {
	document.body.removeEventListener( 'mouseover', onMouseOver );
	document.body.removeEventListener( 'mouseout', onMouseOut );
	document.body.removeEventListener( 'click', onClick );

	const style = document.getElementById( cursorStyleId );
	if ( style ) {
		style.remove();
	}

	removeStyle();
}

function removeStyle() {
	if ( ! highlightedElement ) {
		return;
	}
	highlightedElement.style.outline = '';
}

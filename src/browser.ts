import browser, { Runtime } from 'webextension-polyfill';
import { isWebpack } from '@/config.ts';
type MessageSender = Runtime.MessageSender;

export { type MessageSender };

export function openSidePanelOnExtensionClick() {
	if ( typeof chrome.sidePanel !== 'undefined' ) {
		// Chrome.
		chrome.sidePanel
			.setPanelBehavior( { openPanelOnActionClick: true } )
			.catch( ( error ) => console.error( error ) );
	} else if ( typeof browser.sidebarAction !== 'undefined' ) {
		// Firefox.
		if ( isWebpack() ) {
			browser.action.onClicked.addListener( () => {
				browser.sidebarAction.toggle();
			} );
		} else {
			// wxt targets MV2 for Firefox.
			browser.browserAction.onClicked.addListener( () => {
				browser.sidebarAction.toggle();
			} );
		}
	} else {
		console.error( 'unsupported browser' );
	}
}

export async function getCurrentTabId(): Promise< number | undefined > {
	const tabs = await browser.tabs.query( {
		currentWindow: true,
		active: true,
	} );
	if ( tabs.length !== 1 ) {
		return;
	}
	return tabs[ 0 ]?.id;
}

export async function sendMessageToTab(
	tabId: number,
	message: any
): Promise< any > {
	return browser.tabs.sendMessage( tabId, message );
}

export async function sendMessage( message: any ): Promise< any > {
	return browser.runtime.sendMessage( message );
}

export type OnMessageListener = (
	message: unknown,
	sender: MessageSender,
	sendResponse: ( response?: unknown ) => void
) => true | Promise< unknown > | undefined;

export function addOnMessageListener( listener: OnMessageListener ) {
	browser.runtime.onMessage.addListener( listener );
}

export function hasOnMessageListener( listener: OnMessageListener ): boolean {
	return browser.runtime.onMessage.hasListener( listener );
}

export function removeOnMessageListener( listener: OnMessageListener ) {
	browser.runtime.onMessage.removeListener( listener );
}

export async function localStorageSet( items: {
	[ key: string ]: any;
} ): Promise< void > {
	return browser.storage.local.set( items );
}

export async function localStorageGet(
	keys?: null | string | string[] | { [ key: string ]: any }
): Promise< { [ key: string ]: any } > {
	return browser.storage.local.get( keys );
}

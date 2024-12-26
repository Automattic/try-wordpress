import { Namespace } from '@/bus/Bus';
import { getCurrentTabId, sendMessageToTab } from '@/browser';

export enum CommandTypes {
	GetCurrentPageInfo = 'GetCurrentPageInfo',
	NavigateTo = 'NavigateTo',
	SwitchToDefaultMode = 'SwitchToDefaultMode',
	SwitchToGenericSelectionMode = 'SwitchToGenericSelectionMode',
	SwitchToNavigationSelectionMode = 'SwitchToNavigationSelectionMode',
}

export interface CurrentPageInfo {
	url: string;
	title: string;
}

export type CommandType = `${ CommandTypes }`;

export interface Command {
	type: CommandType;
	payload: object;
}

export async function sendCommandToContent( command: Command ): Promise< any > {
	const currentTabId = await getCurrentTabId();
	if ( ! currentTabId ) {
		throw Error( 'current tab not found' );
	}
	return sendMessageToTab( currentTabId, {
		namespace: Namespace,
		type: command.type,
		payload: command.payload,
	} );
}

import { Namespace } from '@/bus/Bus';
import { sendMessage } from '@/browser';

export enum EventTypes {
	OnElementClick = 'OnElementClick',
}

export type EventType = `${ EventTypes }`;

export interface Event {
	type: EventType;
	payload: object;
}

export interface EventWithResponder {
	event: Event;
	sendResponse: ( response?: any ) => void;
}

export type EventWithNamespace = Event & {
	namespace: string;
};

export async function sendEventToApp( event: Event ): Promise< any > {
	return sendMessage( {
		namespace: Namespace,
		type: event.type,
		payload: event.payload,
	} );
}

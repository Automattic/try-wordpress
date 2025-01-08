import {
	addOnMessageListener,
	hasOnMessageListener,
	MessageSender,
	OnMessageListener,
	removeOnMessageListener,
} from '@/browser';
import { EventType, EventWithNamespace, EventWithResponder } from '@/bus/Event';
import { CommandType } from '@/bus/Command';

export const Namespace = 'TRY_WORDPRESS';
export type EventSender = MessageSender;

export type Listener = (
	event: EventWithNamespace,
	sender: EventSender,
	sendResponse: ( response: any ) => void
) => void;

export function startListening(
	type: EventType | CommandType,
	callback: ( event: EventWithResponder ) => void
): Listener {
	const internalListener = (
		event: EventWithNamespace,
		sender: EventSender,
		sendResponse: ( response?: any ) => void
	) => {
		if ( event.namespace === Namespace && event.type === type ) {
			callback( { event, sendResponse } );
		}
	};
	addOnMessageListener( < OnMessageListener >internalListener );
	return internalListener;
}

export function stopListening( listener: Listener ) {
	if ( hasOnMessageListener( < OnMessageListener >listener ) ) {
		removeOnMessageListener( < OnMessageListener >listener );
	}
}

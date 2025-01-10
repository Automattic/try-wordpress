import { createContext, useContext } from 'react';
import { Session } from '@/storage/session';
import { PlaygroundRemote } from '@/remote/playground/remote';

export interface SessionContext {
	session?: Session;
	remote?: PlaygroundRemote;
}

const sessionContext = createContext< SessionContext >( {} );

export const SessionProvider = sessionContext.Provider;

export function useSessionContext() {
	return useContext( sessionContext );
}

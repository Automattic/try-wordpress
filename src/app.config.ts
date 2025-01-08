import { defineAppConfig } from 'wxt/sandbox';

declare module 'wxt/sandbox' {
	export interface WxtAppConfig {
		opfsEnabled: boolean;
		logApiRequests: boolean;
	}
}

export default defineAppConfig( {
	opfsEnabled: import.meta.env.MODE !== 'development',
	logApiRequests: import.meta.env.MODE === 'development',
} );

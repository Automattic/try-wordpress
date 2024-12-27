import { defineContentScript } from 'wxt/sandbox';
import { contentScript } from '@/extension/content.ts';

export default defineContentScript( {
	matches: [ '*://*/*' ],
	main() {
		contentScript();
	},
} );

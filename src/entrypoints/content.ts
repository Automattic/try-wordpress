import { defineContentScript } from 'wxt/sandbox';
import { contentScript } from '@/extension/content';

export default defineContentScript( {
	matches: [ '*://*/*' ],
	main() {
		contentScript();
	},
} );

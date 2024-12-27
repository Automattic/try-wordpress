import { defineBackground } from 'wxt/sandbox';
import { openSidePanelOnExtensionClick } from '@/browser.ts';

export default defineBackground( () => {
	openSidePanelOnExtensionClick();
} );

import { defineBackground } from 'wxt/sandbox';
import { openSidePanelOnExtensionClick } from '@/browser';

export default defineBackground( () => {
	openSidePanelOnExtensionClick();
} );

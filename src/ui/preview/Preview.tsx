import { ReactNode, useState } from 'react';
import { PreviewTabBar } from '@/ui/preview/PreviewTabBar';
import { PlaceholderPreview } from '@/ui/preview/PlaceholderPreview';

const tabFront = 0;
const tabAdmin = 1;
const defaultTab = tabFront;

export function Preview( props: {
	front: ReactNode;
	admin: ReactNode;
	showPlaceholder: boolean;
	showTabBar: boolean;
} ) {
	const { front, admin, showPlaceholder, showTabBar } = props;
	const [ currentTab, setCurrentTab ] = useState< number >( defaultTab );

	const tabBar = (
		<PreviewTabBar
			entries={ [ 'Preview', 'Admin' ] }
			value={ currentTab }
			className="preview-tabs"
			tabClassName={ 'preview-tabs-tab' }
			onChange={ ( tab: number ) => setCurrentTab( tab ) }
		/>
	);

	const showPreviewFront = currentTab === tabFront;
	const showPreviewAdmin = currentTab === tabAdmin;

	return showPlaceholder ? (
		<PlaceholderPreview />
	) : (
		<>
			<div className={ showTabBar ? '' : 'hidden' }>{ tabBar }</div>
			<div
				className={
					showPreviewFront
						? 'preview-tab-panel'
						: 'preview-tab-panel hidden'
				}
			>
				{ front }
			</div>
			<div
				className={
					showPreviewAdmin
						? 'preview-tab-panel'
						: 'preview-tab-panel hidden'
				}
			>
				{ admin }
			</div>
		</>
	);
}

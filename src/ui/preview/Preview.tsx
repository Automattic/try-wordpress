import { ReactNode, useState } from 'react';
import { PreviewTabBar } from '@/ui/preview/PreviewTabBar';
import { useSessionContext } from '@/ui/session/SessionProvider';

const tabFront = 0;
const tabAdmin = 1;
const defaultTab = tabFront;

export function Preview( props: { front: ReactNode; admin: ReactNode } ) {
	const { front, admin } = props;
	const [ currentTab, setCurrentTab ] = useState< number >( defaultTab );
	const { apiClient } = useSessionContext();

	const isPlaygroundLoading = ! (
		apiClient?.siteUrl && apiClient.siteUrl.length > 0
	);

	const tabBar = (
		<PreviewTabBar
			entries={ [ 'Preview', 'Admin' ] }
			value={ currentTab }
			className="preview-tabs"
			tabClassName={ 'preview-tabs-tab' }
			onChange={ ( tab: number ) => setCurrentTab( tab ) }
		/>
	);

	const showTabBar = ! isPlaygroundLoading;
	const showPreviewFront = currentTab === tabFront;
	const showPreviewAdmin = currentTab === tabAdmin;

	return (
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

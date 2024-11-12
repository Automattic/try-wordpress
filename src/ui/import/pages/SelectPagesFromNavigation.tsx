import { ReactNode, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screens } from '@/ui/App';
import { Steps } from '@/ui/import/pages/ImportPagesFlow';
import { LinkField } from '@/model/field/LinkField';
import { parseNavigationHtml } from '@/parser/navigation';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { useSelectedPages } from '@/ui/import/pages/useSelectedPages';
import { useNavigationHtml } from '@/ui/import/pages/useNavigationHtml';
import { Toolbar } from '@/ui/import/pages/Toolbar';

// Parse the navigation html into a list of links.
// Display page selector for user to select pages to import.
// Selected pages are stored in local storage.
export function SelectPagesFromNavigation() {
	const { session } = useSessionContext();
	const [ navigationHtml ] = useNavigationHtml();
	const [ selected, setSelected ] = useSelectedPages();
	const navigate = useNavigate();

	// If the navigation html is empty, redirect back to the previous step.
	useEffect( () => {
		if ( navigationHtml === '' ) {
			navigate(
				Screens.importPages( session.id, Steps.SelectNavigation )
			);
		}
	}, [ session.id, navigationHtml, navigate ] );

	// Parse the navigation html into a list of links.
	const links = useMemo< LinkField[] >( () => {
		return parseNavigationHtml( navigationHtml ?? '' );
	}, [ navigationHtml ] );

	const elements: ReactNode[] = [];
	links.forEach( ( link ) => {
		const url = link.parsedValue.url;
		const title = link.parsedValue.title;
		elements.push(
			<li key={ url } style={ { border: '1px solid black' } }>
				<input
					type="checkbox"
					checked={ selected && selected.some( ( u ) => u === url ) }
					onChange={ () => {
						if ( ! selected ) {
							return;
						}
						const isChecked = selected.some( ( u ) => u === url );
						if ( isChecked ) {
							// It was previously selected, now it becomes not selected.
							// So we keep other ones.
							setSelected(
								selected.filter( ( u ) => u !== url )
							);
						} else {
							setSelected( selected.concat( url ) );
						}
					} }
				/>
				<p>Title: { title }</p>
				<p>URL: { url }</p>
			</li>
		);
	} );

	return (
		<>
			<Toolbar
				backUrl={ Screens.importPages(
					session.id,
					Steps.SelectNavigation
				) }
				canContinue={ selected && selected.length > 0 }
				continueUrl={ Screens.importPages(
					session.id,
					Steps.ImportPage,
					0
				) }
			/>
			<p>Select the pages you want to import.</p>
			<p>
				Do not select pages that should be automatically generated, like
				your blog posts index page, as those will automatically be
				created.
			</p>
			<ul>{ elements }</ul>
		</>
	);
}

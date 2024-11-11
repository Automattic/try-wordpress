import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNavigationHtml } from '@/storage/navigation';
import { Screens } from '@/ui/App';
import { Steps } from '@/ui/import/pages/ImportPagesFlow';
import { LinkField } from '@/model/field/LinkField';
import { parseNavigationHtml } from '@/parser/navigation';
import { useSessionContext } from '@/ui/session/SessionProvider';

interface Page {
	title: string;
	url: string;
}

export function SelectPages() {
	const { session } = useSessionContext();
	const [ navigationHtml, setNavigationHtml ] = useState< string >();
	const [ selected, setSelected ] = useState< Page[] >( [] );
	const navigate = useNavigate();

	// Load navigation html from local storage.
	// If it's empty, redirect back to the previous step.
	useEffect( () => {
		async function loadNavigation() {
			const html = await getNavigationHtml( session.id );
			if ( html === '' ) {
				navigate(
					Screens.importPages( session.id, Steps.SelectNavigation )
				);
				return;
			}
			setNavigationHtml( html );
		}
		loadNavigation().catch( console.error );
	}, [ session.id, navigate ] );

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
					onChange={ () => {
						const isChecked = selected.some(
							( page ) => page.url === url
						);
						if ( isChecked ) {
							// It was previously selected, now it becomes not selected.
							// So we keep other ones.
							setSelected(
								selected.filter( ( page ) => page.url !== url )
							);
						} else {
							setSelected( selected.concat( { url, title } ) );
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

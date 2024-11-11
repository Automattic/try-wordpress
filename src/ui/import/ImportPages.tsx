import { Toolbar } from '@/ui/components/Toolbar';
import { Screens } from '@/ui/App';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentEventHandler } from '@/ui/blueprints/ContentEventHandler';
import { EventTypes } from '@/bus/Event';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { CommandTypes, sendCommandToContent } from '@/bus/Command';
import { LinkField } from '@/model/field/LinkField';
import { parseNavigationHtml } from '@/parser/navigation';

enum Steps {
	Init = 0,
	SelectNavigation,
	SelectPagesFromNavigation,
}

export function ImportPages() {
	const params = useParams();
	const sessionId = params.sessionId!;
	const step = parseInt( params.step!, 10 );
	const navigate = useNavigate();

	// Enable or disable highlighting in source site, if step requires it.
	useEffect( () => {
		const type =
			step === Steps.SelectNavigation
				? CommandTypes.SwitchToNavigationSelectionMode
				: CommandTypes.SwitchToDefaultMode;
		void sendCommandToContent( { type, payload: {} } );
	}, [ step ] );

	// Disable highlighting on unmount.
	useEffect( () => {
		return () => {
			void sendCommandToContent( {
				type: CommandTypes.SwitchToDefaultMode,
				payload: {},
			} );
		};
	}, [] );

	let element = <></>;
	switch ( step ) {
		case Steps.Init:
			element = (
				<p>
					Navigate to a page that shows the navigation menu. Make sure
					the menu is shown on screen before clicking Continue.
				</p>
			);
			break;
		case Steps.SelectNavigation:
			element = (
				<>
					<p>Click on one of the entries of the navigation menu.</p>
					<p>
						If the menu is not shown on screen, click the Back
						button and then open the menu.
					</p>
				</>
			);
			break;
		case Steps.SelectPagesFromNavigation:
			element = <SelectPages sessionId={ sessionId } />;
			break;
		default:
			throw Error( `unknown step: ${ step }` );
	}

	return (
		<>
			<Toolbar>
				{ step === 0 ? undefined : (
					<button
						onClick={ () => {
							navigate(
								Screens.importPages( sessionId, step - 1 )
							);
						} }
					>
						Back
					</button>
				) }
				<button
					onClick={ () => {
						if ( isLastStep( step ) ) {
							console.log( 'TODO' );
						} else {
							navigate(
								Screens.importPages( sessionId, step + 1 )
							);
						}
					} }
				>
					Continue{ isLastStep( step ) ? ' (TODO)' : '' }
				</button>
			</Toolbar>
			<ContentEventHandler
				eventType={ EventTypes.OnElementClick }
				onEvent={ async ( event ) => {
					void sendCommandToContent( {
						type: CommandTypes.SwitchToDefaultMode,
						payload: {},
					} );
					await saveNavigationHtml(
						sessionId,
						( event.event.payload as any ).content
					);
					navigate( Screens.importPages( sessionId, step + 1 ) );
				} }
			/>
			{ element }
		</>
	);
}

function SelectPages( props: { sessionId: string } ) {
	const { sessionId } = props;
	const [ navigationHtml, setNavigationHtml ] = useState< string >();
	const navigate = useNavigate();

	// Load navigation html from local storage.
	// If it's empty, redirect back to the previous step.
	useEffect( () => {
		async function loadNavigation() {
			const html = await getNavigationHtml( sessionId );
			if ( html === '' ) {
				navigate(
					Screens.importPages( sessionId, Steps.SelectNavigation )
				);
				return;
			}
			setNavigationHtml( html );
		}
		loadNavigation().catch( console.error );
	}, [ sessionId, navigate ] );

	// Parse the navigation html into a list of links.
	const links = useMemo< LinkField[] >( () => {
		return parseNavigationHtml( navigationHtml ?? '' );
	}, [ navigationHtml ] );

	const elements: ReactNode[] = [];
	links.forEach( ( link ) => {
		elements.push(
			<li
				key={ link.parsedValue.url }
				style={ { border: '1px solid black' } }
			>
				<input type="checkbox" />
				<p>Title: { link.parsedValue.title }</p>
				<p>URL: { link.parsedValue.url }</p>
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

function isLastStep( step: number ) {
	const values = Object.entries( Steps )
		.filter( ( [ , val ] ) => typeof val === 'number' )
		.map( ( [ , val ] ) => val ) as number[];
	return step === Math.max( ...values );
}

async function saveNavigationHtml(
	sessionId: string,
	html: string
): Promise< void > {
	const values: Record< string, string > = {};
	values[ navigationKey( sessionId ) ] = html;
	return browser.storage.local.set( values );
}

async function getNavigationHtml( sessionId: string ): Promise< string > {
	const values = await browser.storage.local.get(
		navigationKey( sessionId )
	);
	if ( ! values || ! values[ navigationKey( sessionId ) ] ) {
		return '';
	}
	return values[ navigationKey( sessionId ) ] as string;
}

function navigationKey( sessionId: string ): string {
	return `navigation-${ sessionId }`;
}

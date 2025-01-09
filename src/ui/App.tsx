import { Preview } from '@/ui/preview/Preview';
import {
	createHashRouter,
	createRoutesFromElements,
	LoaderFunction,
	Navigate,
	Outlet,
	Route,
	RouterProvider,
	useLocation,
	useNavigate,
	useRouteLoaderData,
} from 'react-router-dom';
import { StrictMode, useEffect } from 'react';
import { NewSession } from '@/ui/session/NewSession';
import { ViewSession } from '@/ui/session/ViewSession';
import { Home } from '@/ui/Home';
import { getConfig, setConfig } from '@/storage/config';
import { getSession, listSessions, Session } from '@/storage/session';
import { SessionContext, SessionProvider } from '@/ui/session/SessionProvider';
import { Breadcrumbs } from '@/ui/components/Breadcrumbs';
import { NewBlueprint } from '@/ui/blueprints/NewBlueprint';
import { EditBlueprint } from '@/ui/blueprints/EditBlueprint';
import { SubjectType } from '@/model/Subject';
import { ImportWithBlueprint } from '@/ui/import/ImportWithBlueprint';
import { StartPageImport } from '@/ui/import/pages/StartPageImport';
import { SelectNavigation } from '@/ui/import/pages/SelectNavigation';
import { SelectPagesFromNavigation } from '@/ui/import/pages/SelectPagesFromNavigation';
import { ImportPage } from '@/ui/import/pages/ImportPage';
import { Done } from '@/ui/import/pages/Done';
import { usePlaygroundRemote } from '@/remote/playground/remote';

export const Screens = {
	home: () => '/start/home',
	newSession: () => '/start/new-session',
	viewSession: ( sessionId: string ) => `/session/${ sessionId }`,
	blueprints: {
		new: ( sessionId: string, subjectType: SubjectType ) =>
			`/session/${ sessionId }/blueprints/new/${ subjectType }`,
		edit: ( sessionId: string, postId: string ) =>
			`/session/${ sessionId }/blueprints/${ postId }`,
	},
	importWithBlueprint: ( sessionId: string, blueprintId: string ) =>
		`/session/${ sessionId }/import-with-blueprint/${ blueprintId }`,
	importPagesStart: ( sessionId: string ) =>
		`/session/${ sessionId }/import-pages/start`,
	importPagesSelectNavigation: ( sessionId: string ) =>
		`/session/${ sessionId }/import-pages/select-navigation`,
	importPagesSelectPages: ( sessionId: string ) =>
		`/session/${ sessionId }/import-pages/select-pages-from-navigation`,
	importPagesImportPage: ( sessionId: string, page: number ) =>
		`/session/${ sessionId }/import-pages/import-page/${ page }`,
	importPagesDone: ( sessionId: string ) =>
		`/session/${ sessionId }/import-pages/done`,
};

const homeLoader: LoaderFunction = async () => {
	return await listSessions();
};

const sessionLoader: LoaderFunction = async ( { params } ) => {
	const sessionId = params.sessionId;
	if ( ! sessionId ) {
		throw new Response( 'sessionId param is required', { status: 404 } );
	}
	const session = await getSession( sessionId );
	if ( ! session ) {
		throw new Response( `Session with id ${ sessionId } was not found`, {
			status: 404,
		} );
	}
	return session;
};

function Routes( props: { initialScreen: string } ) {
	const { initialScreen } = props;
	return (
		<Route path="/" element={ <App /> }>
			<Route
				index
				element={ <Navigate to={ initialScreen } replace /> }
			/>
			<Route path="start">
				<Route path="home" element={ <Home /> } loader={ homeLoader } />
				<Route path="new-session" element={ <NewSession /> } />
			</Route>
			<Route
				id="session"
				path="session/:sessionId"
				loader={ sessionLoader }
			>
				<Route path="" element={ <ViewSession /> } />
				<Route path="blueprints">
					<Route
						path="new/:subjectType"
						element={ <NewBlueprint /> }
					/>
					<Route path=":blueprintId" element={ <EditBlueprint /> } />
				</Route>
				<Route
					path="import-with-blueprint/:blueprintId"
					element={ <ImportWithBlueprint /> }
				/>
				<Route path="import-pages">
					<Route path="start" element={ <StartPageImport /> } />
					<Route
						path="select-navigation"
						element={ <SelectNavigation /> }
					/>
					<Route
						path="select-pages-from-navigation"
						element={ <SelectPagesFromNavigation /> }
					/>
					<Route
						path="import-page/:page"
						element={ <ImportPage /> }
					/>
					<Route path="done" element={ <Done /> } />
				</Route>
			</Route>
		</Route>
	);
}

function App() {
	const navigate = useNavigate();
	const location = useLocation();
	useEffect( () => {
		setConfig( { currentPath: location.pathname } ).catch( console.error );
	}, [ location ] );

	const session = useRouteLoaderData( 'session' ) as Session | undefined;
	const remote = usePlaygroundRemote( { session } );
	const sectionContext: SessionContext = { session, remote };

	// Debugging tools.
	useEffect( () => {
		if ( ! ( window as any ).trywp ) {
			( window as any ).trywp = {
				navigateTo: ( url: string ) => navigate( url ),
			};
		}
		if ( remote?.api ) {
			( window as any ).trywp.remote = remote;
		}
	}, [ remote, navigate ] );

	return (
		<SessionProvider value={ sectionContext }>
			<div className="app">
				<Breadcrumbs className="breadcrumbs" />
				<div className="app-main">
					<Outlet />
				</div>
			</div>
			<div className="preview">
				<Preview
					showPlaceholder={ ! session }
					front={ remote?.front }
					admin={ remote?.admin }
					showTabBar={ remote?.isReady ?? false }
				/>
			</div>
		</SessionProvider>
	);
}

export async function createApp() {
	const config = await getConfig();
	let initialScreen = config.currentPath;
	if ( ! initialScreen || initialScreen === '/' ) {
		initialScreen = Screens.home();
	}

	const router = createHashRouter(
		createRoutesFromElements( Routes( { initialScreen } ) )
	);

	return (
		<StrictMode>
			<RouterProvider router={ router } />
		</StrictMode>
	);
}

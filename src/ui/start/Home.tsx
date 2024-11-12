import { useLoaderData, useNavigate } from 'react-router-dom';
import { Screens } from '@/ui/App';
import { Session } from '@/storage/session';

export function Home() {
	const navigate = useNavigate();
	const sessions = useLoaderData() as Session[];
	return (
		<>
			<h1 className="hidden">Try WordPress</h1>
			<p>
				<strong>Migrate from any site to WordPress.</strong>
			</p>
			<p>Import using this tool, and preview the result immediately.</p>
			<SessionPicker sessions={ sessions } />
			<button
				className="button-block"
				onClick={ () => navigate( Screens.newSession() ) }
			>
				Start importing
			</button>
		</>
	);
}

function SessionPicker( props: { sessions: Session[] } ) {
	const { sessions } = props;
	const navigate = useNavigate();

	if ( sessions.length === 0 ) {
		return;
	}

	return (
		<>
			<p>Continue a previous session:</p>
			<ul className="section">
				{ sessions.map( ( session ) => {
					return (
						<li key={ session.id }>
							<button
								className="button-block"
								onClick={ () =>
									navigate(
										Screens.viewSession( session.id )
									)
								}
							>
								{ session.title } ({ session.url })
							</button>
						</li>
					);
				} ) }
			</ul>
			<p>Or:</p>
		</>
	);
}

import { useSessionContext } from '@/ui/session/SessionProvider';
import { useNavigate } from 'react-router-dom';
import { Screens } from '@/ui/App';
import { SubjectType } from '@/model/Subject';
import { Button } from '@wordpress/components';

export function ViewSession() {
	const { session } = useSessionContext();
	const navigate = useNavigate();

	const importButtons = [
		{
			text: 'Import Posts',
			url: Screens.blueprints.new( session.id, SubjectType.BlogPost ),
		},
		{
			text: 'Import Pages',
			url: Screens.importPagesStart( session.id ),
		},
	];

	return (
		<>
			<h1>
				{ session.title } ({ session.url })
			</h1>
			<ul>
				{ importButtons.map( ( { text, url } ) => (
					<li key={ url }>
						<Button
							variant="primary"
							className="button-block"
							onClick={ () => navigate( url ) }
						>
							{ text }
						</Button>
					</li>
				) ) }
			</ul>
		</>
	);
}

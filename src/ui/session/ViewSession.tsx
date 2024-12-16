import { useSessionContext } from '@/ui/session/SessionProvider';
import { useNavigate } from 'react-router-dom';
import { Screens } from '@/ui/App';
import { SubjectType } from '@/model/Subject';
import { Button } from '@wordpress/components';
import { getSchemas } from '@/model/Schema';

const schemas = getSchemas();

export function ViewSession() {
	const { session } = useSessionContext();
	const navigate = useNavigate();

	const importButtons: { text: string; url: string }[] = [];
	Object.keys( schemas ).forEach( ( subjectType ) => {
		// Pages get a specific button.
		if ( subjectType === SubjectType.Page ) {
			importButtons.push( {
				text: `Import Pages`,
				url: Screens.importPagesStart( session.id ),
			} );
			return;
		}

		const schema = schemas[ subjectType ];
		importButtons.push( {
			text: `Import ${ schema.title }s`,
			url: Screens.blueprints.new( session.id, schema.slug ),
		} );
	} );

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

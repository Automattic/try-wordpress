import { Toolbar } from '@/ui/components/Toolbar';
import { Screens } from '@/ui/App';
import { useNavigate, useParams } from 'react-router-dom';

enum Steps {
	Init = 0,
	SelectNavigation,
}

export function ImportPages() {
	const params = useParams();
	const sessionId = params.sessionId!;
	const step = parseInt( params.step!, 10 );
	const navigate = useNavigate();

	let element = <></>;
	switch ( step ) {
		case Steps.Init:
			element = <>Navigate to a page that shows the navigation menu</>;
			break;
		case Steps.SelectNavigation:
			element = (
				<>
					<>Click on the navigation menu</>
				</>
			);
			break;
		default:
			throw Error( `unknown step: ${ step }` );
	}

	return (
		<>
			<Toolbar>
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
					Continue
				</button>
			</Toolbar>
			{ element }
		</>
	);
}

function isLastStep( step: number ) {
	const values = Object.entries( Steps )
		.filter( ( [ , val ] ) => typeof val === 'number' )
		.map( ( [ , val ] ) => val ) as number[];
	return step === Math.max( ...values );
}

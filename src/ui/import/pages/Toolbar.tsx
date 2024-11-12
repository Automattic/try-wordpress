import { Toolbar as BaseToolbar } from '@/ui/components/Toolbar';
import { useNavigate } from 'react-router-dom';

export function Toolbar( props: {
	canContinue?: boolean;
	continueUrl?: string;
	backUrl?: string;
} ) {
	const { canContinue, continueUrl, backUrl } = props;
	const navigate = useNavigate();

	return (
		<BaseToolbar>
			{ ! backUrl ? undefined : (
				<button onClick={ () => navigate( backUrl ) }>Back</button>
			) }
			{ ! continueUrl ? undefined : (
				<button
					disabled={ ! canContinue }
					onClick={ () => navigate( continueUrl ) }
				>
					Continue
				</button>
			) }
		</BaseToolbar>
	);
}

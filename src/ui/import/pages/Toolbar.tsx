import { Toolbar as BaseToolbar } from '@/ui/components/Toolbar';
import { useNavigate } from 'react-router-dom';
import { Button } from '@wordpress/components';

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
				<Button
					variant="secondary"
					onClick={ () => navigate( backUrl ) }
				>
					Back
				</Button>
			) }
			{ ! continueUrl ? undefined : (
				<Button
					variant="primary"
					disabled={ ! canContinue }
					onClick={ () => navigate( continueUrl ) }
				>
					Continue
				</Button>
			) }
		</BaseToolbar>
	);
}

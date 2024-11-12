import { useParams } from 'react-router-dom';
import { SelectPagesFromNavigation } from '@/ui/import/pages/SelectPagesFromNavigation';
import { ImportPage } from '@/ui/import/pages/ImportPage';
import { SelectNavigation } from '@/ui/import/pages/SelectNavigation';
import { StartPageImport } from '@/ui/import/pages/StartPageImport';

/* eslint-disable @typescript-eslint/no-shadow */
export enum Steps {
	Init = 0,
	SelectNavigation,
	SelectPagesFromNavigation,
	ImportPage,
}
/* eslint-enable @typescript-eslint/no-shadow */

export function ImportPagesFlow() {
	const params = useParams();
	const step = parseInt( params.step!, 10 );

	let element = <></>;
	switch ( step ) {
		case Steps.Init:
			element = <StartPageImport />;
			break;
		case Steps.SelectNavigation:
			element = <SelectNavigation />;
			break;
		case Steps.SelectPagesFromNavigation:
			element = <SelectPagesFromNavigation />;
			break;
		case Steps.ImportPage:
			element = <ImportPage />;
			break;
		default:
			throw Error( `unknown step: ${ step }` );
	}

	return element;
}

import { Blueprint } from '@/model/Blueprint';
import { useSessionContext } from '@/ui/session/SessionProvider';
import { useEffect, useState } from 'react';
import { findBlueprintById } from '@/storage/blueprint';

export function useBlueprint(
	blueprintId: string
): [ Blueprint | undefined, ( blueprint: Blueprint ) => void ] {
	const [ blueprint, setBlueprint ] = useState< Blueprint >();
	const { api } = useSessionContext();

	useEffect( () => {
		if ( api ) {
			findBlueprintById( blueprintId )
				.then( ( bp ) => {
					if ( ! bp ) {
						throw Error(
							`blueprint with id ${ blueprintId } not found`
						);
					}
					setBlueprint( bp );
				} )
				.catch( console.error );
		}
	}, [ blueprintId, api ] );

	return [ blueprint, setBlueprint ];
}

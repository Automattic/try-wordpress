import { Blueprint } from '@/model/Blueprint';
import { useEffect, useState } from 'react';
import { findBlueprintById } from '@/storage/blueprint';

export function useBlueprint(
	blueprintId: string
): [ Blueprint | undefined, ( blueprint: Blueprint ) => void ] {
	const [ blueprint, setBlueprint ] = useState< Blueprint >();

	useEffect( () => {
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
	}, [ blueprintId ] );

	return [ blueprint, setBlueprint ];
}

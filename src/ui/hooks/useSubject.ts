import { Subject, SubjectType } from '@/model/Subject';
import { useEffect, useState } from 'react';
import { useSessionContext } from '@/ui/session/SessionProvider';

// Create or load a Subject by its source URL.
// If a Subject already exists for the source URL, we use that Subject,
// otherwise we create a new one.
export function useSubject(
	type: SubjectType | undefined,
	sourceUrl: string | undefined
): [ Subject | undefined, ( subject: Subject ) => void ] {
	const [ subject, setSubject ] = useState< Subject >();
	const { api } = useSessionContext();

	useEffect( () => {
		async function loadSubject() {
			if ( ! type || ! sourceUrl || ! api ) {
				return;
			}
			let subj = await api!.subjects.findBySourceUrl( type, sourceUrl );
			if ( ! subj ) {
				subj = await api!.subjects.create( type, sourceUrl );
			}
			setSubject( subj );
		}
		loadSubject().catch( console.error );
	}, [ type, sourceUrl, api ] );

	return [ subject, setSubject ];
}

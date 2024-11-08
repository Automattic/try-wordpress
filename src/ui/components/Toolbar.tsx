import { PropsWithChildren } from 'react';

export function Toolbar( props: PropsWithChildren ) {
	return <div className="toolbar">{ props.children }</div>;
}

export function PlaceholderPreview() {
	return (
		<div
			style={ {
				width: '100%',
				height: '100%',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				opacity: '0.3',
			} }
		>
			<img
				src="icons/icon-128.png"
				alt="Icon"
				style={ {
					display: 'block',
					width: '50px',
					height: '50px',
				} }
			/>
		</div>
	);
}

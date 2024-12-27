export function isWebpack(): boolean {
	return typeof process !== 'undefined' && process.env.IS_WEBPACK === 'true';
}

export function isOpfsEnabled(): boolean {
	return isWebpack()
		? process.env.OPFS_ENABLED === 'true'
		: // @ts-ignore
		  import.meta.env.MODE !== 'development';
}

export function shouldLogApiRequests(): boolean {
	return isWebpack()
		? process.env.LOG_REQUESTS === 'true'
		: // @ts-ignore
		  import.meta.env.MODE === 'development';
}

export function isWebpack(): boolean {
	return typeof process !== 'undefined' && process.env.IS_WEBPACK === 'true';
}

export function isOpfsEnabled(): boolean {
	return process.env.OPFS_ENABLED === 'true';
}

export function shouldLogApiRequests(): boolean {
	return process.env.LOG_REQUESTS === 'true';
}

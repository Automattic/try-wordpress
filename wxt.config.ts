import {
	ConfigEnv,
	defineConfig,
	ExtensionRunnerConfig,
	ResolvedPublicFile,
	UserManifest,
	Wxt,
} from 'wxt';
import archiver from 'archiver';
import { createWriteStream } from 'node:fs';
import path from 'node:path';

// For information on configuring wxt see:
// https://wxt.dev/guide/essentials/config/manifest

export default defineConfig( {
	runner: runner(),
	manifest,
	modules: [ '@wxt-dev/module-react' ],
	imports: false,
	srcDir: 'src',
	outDir: 'build/wxt',
	publicDir: '../public',
	extensionApi: 'webextension-polyfill',
	alias: {
		'@schema': './schema',
	},
	// For more information on hooks see:
	// https://wxt.dev/guide/essentials/config/hooks
	// https://wxt.dev/api/reference/wxt/interfaces/WxtHooks.html
	hooks: {
		'build:publicAssets': async ( wxt, assets ) => {
			await buildPlugin( wxt, assets );
		},
	},
} );

// Configure browser startup. For more information see:
// - https://wxt.dev/guide/essentials/config/browser-startup.html
// - https://wxt.dev/api/reference/wxt/interfaces/ExtensionRunnerConfig.html
//
// You can override runner configuration by creating a web-ext.config.ts file,
// which is hidden from git. For more information see:
// https://wxt.dev/guide/essentials/config/browser-startup.html#config-files
function runner(): ExtensionRunnerConfig {
	return {
		openConsole: true,
		openDevtools: true,
		chromiumArgs: [
			'--user-data-dir=./.wxt/chrome-data',
			'--hide-crash-restore-bubble',
		],
		// https://wxt.dev/api/reference/wxt/interfaces/ExtensionRunnerConfig.html#chromiumpref
		chromiumPref: {
			session: {
				restore_on_startup: 1,
			},
			extensions: {
				ui: {
					developer_mode: true,
				},
			},
		},
	};
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function manifest( env: ConfigEnv ): UserManifest {
	return {
		name: 'Try WordPress',
		description: 'An extension that liberates your data into WordPress',
		permissions: [ 'storage' ],
		action: {},
	};
}

async function buildPlugin( wxt: Wxt, assets: ResolvedPublicFile[] ) {
	const zipPath = path.join( __dirname, 'build', 'wxt', 'plugin.zip' );
	const output = createWriteStream( zipPath );
	const archive = archiver( 'zip', {} );

	archive.pipe( output );
	await archive
		.glob( '**/*', {
			cwd: __dirname + '/src/plugin',
			ignore: [ 'vendor/**' ],
		} )
		.finalize();

	await new Promise( ( resolve ) => output.on( 'close', resolve ) );

	assets.push( {
		absoluteSrc: zipPath,
		relativeDest: 'plugin.zip',
	} );
}

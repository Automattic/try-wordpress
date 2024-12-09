const path = require( 'node:path' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const { TsconfigPathsPlugin } = require( 'tsconfig-paths-webpack-plugin' );
const FileManagerPlugin = require( 'filemanager-webpack-plugin' );
const webpack = require( 'webpack' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const fs = require( 'fs' );

// @TODO: Sample paths, need to update
const SCHEMA_SRC_DIR = './schema';
const SCHEMA_OUTPUT_NAME = 'schema.json';
const SCHEMA_OUTPUT_PATHS = [ './dist/config', './public/config' ];

module.exports = function ( env ) {
	let targets = [ 'firefox', 'chrome' ];
	const mode = env.mode || 'development';

	// Validate environment
	if ( mode === 'production' && ! env.target ) {
		throw new Error(
			'Production builds require a target. Use --env target=firefox or --env target=chrome'
		);
	}

	// Set target(s)
	if ( env.target ) {
		targets = [ env.target ];
	}

	let modules = [];
	for ( const target of targets ) {
		modules = modules.concat( extensionModules( mode, target ) );
	}

	return modules;
};

// Build the extension.
function extensionModules( mode, target ) {
	let outputDir = path.resolve( __dirname, 'build' );
	if ( mode === 'production' ) {
		outputDir = path.resolve( outputDir, 'production' );
	}
	const targetPath = path.resolve( outputDir, target );

	const devtool = mode === 'production' ? false : 'cheap-module-source-map';
	const resolve = {
		extensions: [ '.ts', '.tsx', '.js' ],
		plugins: [ new TsconfigPathsPlugin() ],
	};
	const module = {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
			},
			{
				// If you enable `experiments.css` or `experiments.futureDefaults`, please uncomment line below
				// type: "javascript/auto",
				test: /\.(sa|sc|c)ss$/i,
				use: [
					mode === 'production'
						? MiniCssExtractPlugin.loader
						: 'style-loader',
					'css-loader',
					'postcss-loader',
					'sass-loader',
				],
			},
		],
	};

	const webExtensionPolyfillPlugin = new webpack.ProvidePlugin( {
		browser: 'webextension-polyfill',
	} );

	const envPlugin = new webpack.DefinePlugin( {
		'process.env.OPFS_ENABLED': JSON.stringify(
			mode === 'production' ? 'true' : 'false'
		),
	} );

	return [
		// Extension background script.
		{
			mode,
			devtool,
			resolve,
			module,
			entry: [ 'webextension-polyfill', './src/extension/background.ts' ],
			output: {
				path: targetPath,
				filename: path.join( 'background.js' ),
			},
			plugins: [
				new CopyPlugin( {
					patterns: [
						{
							from: `./src/extension/manifest-${ target }.json`,
							to: path.join( targetPath, 'manifest.json' ),
						},
						{
							from: './src/extension/icons',
							to: path.join( targetPath, 'icons' ),
						},
					],
				} ),
				webExtensionPolyfillPlugin,
				envPlugin,
				new EmitMergedJsonPlugin(),
			],
		},
		// Extension content script.
		{
			mode,
			devtool,
			resolve,
			module,
			entry: [ 'webextension-polyfill', './src/extension/content.ts' ],
			output: {
				path: targetPath,
				filename: path.join( 'content.js' ),
			},
			plugins: [ webExtensionPolyfillPlugin, envPlugin ],
		},
		// The app.
		{
			mode,
			devtool,
			resolve,
			module,
			entry: [ 'webextension-polyfill', './src/ui/main.ts' ],
			output: {
				path: targetPath,
				filename: path.join( 'app.js' ),
			},
			plugins: [
				new CopyPlugin( {
					patterns: [
						{
							from: './src/ui/app.html',
							to: path.join( targetPath, 'app.html' ),
						},
					],
				} ),
				new CopyPlugin( {
					patterns: [
						{
							from: '**/*',
							context: 'src/plugin/',
							globOptions: {
								ignore: [ '**/plugin/vendor/**/*' ],
							},
							to: path.join( targetPath, 'plugin' ),
						},
					],
				} ),
				// Create plugin.zip.
				new FileManagerPlugin( {
					events: {
						onEnd: {
							archive: [
								{
									source: path.join( targetPath, 'plugin' ),
									destination: path.join(
										targetPath,
										'plugin.zip'
									),
								},
							],
						},
					},
				} ),
				webExtensionPolyfillPlugin,
				envPlugin,
			].concat(
				mode === 'production' ? [ new MiniCssExtractPlugin() ] : []
			),
		},
	];
}

// Create a custom plugin to emit the merged JSON file
class EmitMergedJsonPlugin {
	apply( compiler ) {
		compiler.hooks.emit.tapAsync(
			'EmitMergedJsonPlugin',
			async ( compilation, callback ) => {
				try {
					const mergedContent = JSON.stringify(
						await mergeJsonFiles( SCHEMA_SRC_DIR ),
						null,
						2
					);

					// Write to all output paths
					await Promise.all(
						SCHEMA_OUTPUT_PATHS.map( async ( outputPath ) => {
							await fs.promises.mkdir( outputPath, {
								recursive: true,
							} );
							await fs.promises.writeFile(
								path.join( outputPath, SCHEMA_OUTPUT_NAME ),
								mergedContent
							);
						} )
					);

					// Also emit for webpack output
					compilation.assets[ SCHEMA_OUTPUT_NAME ] = {
						source: () => mergedContent,
						size: () => mergedContent.length,
					};
				} catch ( error ) {
					console.error( 'Error during JSON merge:', error );
				}
				callback();
			}
		);
	}
}

async function mergeJsonFiles( sourceDir ) {
	const mergedData = {};

	const files = ( await fs.promises.readdir( sourceDir ) ).filter( ( file ) =>
		file.endsWith( '.json' )
	);

	await Promise.all(
		files.map( async ( file ) => {
			const filePath = path.join( sourceDir, file );
			try {
				const fileContent = await fs.promises.readFile(
					filePath,
					'utf8'
				);
				const jsonData = JSON.parse( fileContent );
				Object.assign( mergedData, jsonData );
			} catch ( error ) {
				console.error( `Error parsing JSON file ${ file }:`, error );
			}
		} )
	);

	return mergedData;
}

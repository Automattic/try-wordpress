import { Blueprint, StepDefinition } from '@wp-playground/client';

export function blueprint( blogName: string ): Blueprint {
	return {
		login: true,
		steps: steps(),
		siteOptions: {
			blogname: blogName,
		},
	};
}

function steps(): StepDefinition[] {
	return [
		{
			step: 'defineWpConfigConsts',
			consts: {
				WP_ENVIRONMENT_TYPE: 'local',
			},
		},
		{
			step: 'login',
			username: 'admin',
			password: 'password',
		},
		{
			step: 'updateUserMeta',
			userId: 1,
			meta: {
				admin_color: 'modern',
			},
		},
		{
			step: 'runPHP',
			code: deleteDefaultContent(),
		},
		{
			step: 'runPHP',
			code: createHomePage(),
		},
		{
			step: 'unzip',
			zipFile: {
				resource: 'url',
				url: 'plugin.zip',
			},
			extractToPath: '/wordpress/wp-content/plugins/try-wordpress',
		},
		{
			step: 'activatePlugin',
			pluginName: 'Try WordPress',
			pluginPath: '/wordpress/wp-content/plugins/try-wordpress',
		},
		{
			step: 'mkdir',
			path: '/wordpress/wp-content/mu-plugins',
		},
		{
			step: 'writeFile',
			path: '/wordpress/wp-content/mu-plugins/authenticate-rest-request.php',
			data: authenticateRestRequest(),
		},
	];
}

function authenticateRestRequest(): string {
	return `<?php
add_filter( "rest_authentication_errors", "__return_true" );
add_filter( "determine_current_user", function() { return 1; }, 99999 );
`;
}

function deleteDefaultContent(): string {
	return `<?php
require_once 'wordpress/wp-load.php';
wp_delete_post( 1, true );
wp_delete_post( 2, true );
wp_delete_post( 3, true );
`;
}

function createHomePage(): string {
	return `<?php
require_once 'wordpress/wp-load.php';
$term = get_term_by('slug', 'twentytwentyfour', 'wp_theme');
if(!$term){
    $term = wp_insert_term(
        'twentytwentyfour',
        'wp_theme'
    );
    $term_id = $term['term_id'];
} else {
    $term_id = $term->term_id;
}
$post_id = wp_insert_post(array(
    'post_title' => 'Home',
    'post_name' => 'home',
    'post_type' => 'wp_template',
    'post_status' => 'publish',
    'tax_input' => array(
        'wp_theme' => array($term_id)
    ),
    'post_content' => '<!-- wp:template-part {"slug":"header","theme":"twentytwentyfour","tagName":"header","area":"header"} /-->
<!-- wp:group {"tagName":"main","style":{"spacing":{"blockGap":"0","margin":{"top":"0"},"padding":{"right":"var:preset|spacing|20","left":"var:preset|spacing|20"}}},"layout":{"type":"default"}} -->
<main class="wp-block-group" style="margin-top:0;padding-right:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)"><!-- wp:query {"queryId":5,"query":{"perPage":"30","pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false}} -->
<div class="wp-block-query"><!-- wp:post-template -->
<!-- wp:post-title {"isLink":true} /-->
<!-- wp:post-date /-->
<!-- /wp:post-template -->
<!-- wp:query-pagination -->
<!-- wp:query-pagination-previous /-->
<!-- wp:query-pagination-numbers /-->
<!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->
<!-- wp:query-no-results -->
<!-- wp:paragraph {"placeholder":"Add text or blocks that will display when a query returns no results."} -->
<p></p>
<!-- /wp:paragraph -->
<!-- /wp:query-no-results --></div>
<!-- /wp:query --></main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","theme":"twentytwentyfour","tagName":"footer","area":"footer"} /-->',
    ));
wp_set_object_terms($post_id, $term_id, 'wp_theme');
`;
}

<?php

use DotOrg\TryWordPress\Page_Controller;
use PHPUnit\Framework\TestCase;

class Page_Controller_Test extends TestCase {
	private Page_Controller $page_controller;

	private string $namespace           = 'try-wp/v1';
	private string $subject_type_plural = 'pages';
	private string $endpoint;
	private string $storage_post_type = 'lib_3';

	private string $raw_title       = '<h1>This is the test title</h1>';
	private string $parsed_title    = 'This is the test title';
	private string $raw_date        = '<time>25 Oct 2024 18:39:20</time>';
	private string $parsed_date     = '2024-10-25 18:39:20';
	private string $date_iso_string = '2024-10-25T18:39:20.000Z';
	private string $raw_content     = '<div><p>This is the test content.</p></div>';
	private string $parsed_content  = '<p>This is the test content.</p>';

	protected function setUp(): void {
		parent::setUp();

		$this->endpoint = '/' . $this->namespace . '/' . $this->subject_type_plural;

		// we instantiate Promoter class so that sample post we insert also has its transformed post saved in the database
		$promoter = new \DotOrg\TryWordPress\Promoter( $this->storage_post_type );

		$this->page_controller = new Page_Controller( $this->storage_post_type );
	}

	public function testRegisterRoutes(): void {
		do_action( 'rest_api_init' ); // so that register_route() executes.

		$routes = rest_get_server()->get_routes( $this->namespace );
		$this->assertArrayHasKey( $this->endpoint, $routes );
		$this->assertArrayHasKey( $this->endpoint . '/(?P<id>\d+)', $routes );
		$this->assertArrayHasKey( $this->endpoint . '/schema', $routes );
	}

	public function testSchemaEndpoint() {
		$api_endpoint = $this->endpoint . '/schema';

		$request  = new WP_REST_Request( 'GET', $api_endpoint );
		$response = rest_do_request( $request );

		$schema = $this->page_controller->get_item_schema();
		$this->assertEquals(
			$this->remove_arg_options_from_schema( $schema ),
			$response->get_data()
		);
	}

	private function remove_arg_options_from_schema( &$schema ) {
		foreach ( $schema['properties'] as &$property ) {
			unset( $property['arg_options'] );
		}
		return $schema;
	}

	public function testCreateItemEmptyBody() {
		$api_endpoint = $this->endpoint;

		$request = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$response = rest_do_request( $request );

		$this->assertEquals( 400, $response->get_status() );
	}

	public function testCreateItemMinimalBody() {
		$api_endpoint = $this->endpoint;
		$source_url   = 'https://example.org/1';

		$request = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'sourceUrl' => $source_url,
				)
			)
		);
		$response = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );

		// read from db
		$post = get_post( $response->get_data()['id'] );
		$this->assertEquals( $source_url, $post->guid );
	}

	/**
	 * @group failing
	 */
	public function testCreateItemFullBody() {
		global $wpdb;

		$source_url = 'https://example.org/2';
		$author_id  = 23;

		// phpcs:ignore
		$biggest_post_id = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT ID FROM $wpdb->posts WHERE post_type = %s ORDER BY ID DESC LIMIT 1",
				$this->storage_post_type
			)
		);

		$request = new WP_REST_Request( 'POST', $this->endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'sourceUrl'     => $source_url,
					'rawTitle'      => $this->raw_title,
					'parsedTitle'   => $this->parsed_title,
					'rawContent'    => $this->raw_content,
					'parsedContent' => $this->parsed_content,
					'rawDate'       => $this->raw_date,
					'parsedDate'    => $this->date_iso_string,
					'authorId'      => $author_id,
				)
			)
		);
		$response = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );
		$response_data = $response->get_data();

		$this->assertGreaterThan( $biggest_post_id, $response_data['id'] );
		$this->assertEquals( $author_id, $response_data['authorId'] );
		$this->assertEquals( $this->raw_title, $response_data['rawTitle'] );
		$this->assertEquals( $this->parsed_title, $response_data['parsedTitle'] );
		$this->assertEquals( $this->raw_content, $response_data['rawContent'] );
		$this->assertEquals( $this->parsed_content, $response_data['parsedContent'] );
		$this->assertEquals( $this->raw_date, $response_data['rawDate'] );
		$this->assertEquals( $this->parsed_date, $response_data['parsedDate'] );
		$this->assertEquals( $source_url, $response_data['sourceUrl'] );

		$this->assertNotEmpty( $response_data['transformedId'] );

		// read from db
		$post = get_post( $response_data['id'] );
		$this->assertEquals( $source_url, $post->guid );
		$this->assertEquals( $this->parsed_title, $post->post_title );
		$this->assertEquals( $this->parsed_content, $post->post_content );
		$this->assertEquals( $author_id, $post->post_author );
		$this->assertEquals( $this->parsed_date, $post->post_date );
	}

	public function testCreateItemMissingSourceUrl() {
		$date         = '2000-10-25 18:39:03';
		$api_endpoint = $this->endpoint;
		$post_title   = 'This is an awesome post title';
		$post_content = 'This is an awesome post body';
		$author_id    = 23;

		$request = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'title'    => $post_title,
					'content'  => $post_content,
					'date'     => $date,
					'authorId' => $author_id,
				)
			)
		);
		$response = rest_do_request( $request );

		$this->assertEquals( 400, $response->get_status() );
	}

	public function testUpdateItem() {
		// First create a post to update
		$source_url = 'https://example.org/original';
		$request    = new WP_REST_Request( 'POST', $this->endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'sourceUrl'     => $source_url,
					'parsedTitle'   => 'Original Title',
					'parsedContent' => 'Original Content',
				)
			)
		);
		$response = rest_do_request( $request );
		$post_id  = $response->get_data()['id'];

		// Now update the post
		$update_endpoint = $this->endpoint . '/' . $post_id;
		$new_title       = 'Updated Title';
		$new_content     = 'Updated Content';

		$request = new WP_REST_Request( 'PUT', $update_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'parsedTitle'   => $new_title,
					'parsedContent' => $new_content,
					'sourceUrl'     => $source_url,
				)
			)
		);
		$response = rest_do_request( $request );
		$this->assertEquals( 200, $response->get_status() );
		$response_data = $response->get_data();

		// Verify response data
		$this->assertEquals( $post_id, $response_data['id'] );
		$this->assertEquals( $new_title, $response_data['parsedTitle'] );
		$this->assertEquals( $new_content, $response_data['parsedContent'] );
		$this->assertEquals( $source_url, $response_data['sourceUrl'] );

		// Verify database update
		$post = get_post( $post_id );
		$this->assertEquals( $new_title, $post->post_title );
		$this->assertEquals( $new_content, $post->post_content );
		$this->assertEquals( $source_url, $post->guid );
	}

	public function testDeleteItem() {
		// First create a post to delete
		$api_endpoint = $this->endpoint;
		$request      = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'sourceUrl' => 'https://example.org/to-delete',
				)
			)
		);
		$response = rest_do_request( $request );
		$post_id  = $response->get_data()['id'];

		// Now delete the post
		$delete_endpoint = $this->endpoint . '/' . $post_id;
		$request         = new WP_REST_Request( 'DELETE', $delete_endpoint );
		$response        = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertTrue( $response->get_data() );

		// Verify post is in trash
		$post = get_post( $post_id );
		$this->assertEquals( 'trash', $post->post_status );
	}

	public function testDeleteNonexistentItem() {
		$delete_endpoint = $this->endpoint . '/99999';
		$request         = new WP_REST_Request( 'DELETE', $delete_endpoint );
		$response        = rest_do_request( $request );

		$this->assertEquals( 404, $response->get_status() );
	}

	public function testFindBySourceUrlNoArgs() {
		$api_endpoint = $this->endpoint;
		$request      = new WP_REST_Request( 'GET', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );

		$response = rest_do_request( $request );

		$this->assertEquals( 400, $response->get_status() );
	}

	public function testFindBySourceUrlNoUrl() {
		$api_endpoint = $this->endpoint;
		$request      = new WP_REST_Request( 'GET', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_query_params(
			array(
				'sourceurl' => '',
			)
		);

		$response = rest_do_request( $request );

		$this->assertEquals( 400, $response->get_status() );
	}

	public function testFindBySourceUrlValidUrl() {
		// First create a post to lookup
		$api_endpoint = $this->endpoint;
		$request      = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'sourceUrl' => 'https://example.org/lookmeup2',
				)
			)
		);
		$response = rest_do_request( $request );
		$post_id  = $response->get_data()['id'];

		$request = new WP_REST_Request( 'GET', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_query_params(
			array(
				'sourceurl' => 'https://example.org/lookmeup2',
			)
		);

		$response = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( $post_id, $response->get_data()['id'] );
	}

	public function testFindBySourceUrlInvalidUrl() {
		$api_endpoint = $this->endpoint;
		$request      = new WP_REST_Request( 'GET', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_query_params(
			array(
				'sourceurl' => 'https://example.org/nonexistent',
			)
		);

		$response = rest_do_request( $request );

		$this->assertEquals( 404, $response->get_status() );
	}

	public function testGuidCache(): void {
		$source_url  = 'https://example.org/guidcachetesting';
		$cache_group = 'try_wp';
		$cache_key   = 'try_wp_cache_guid_' . md5( $source_url );

		// First create a post
		$api_endpoint = $this->endpoint;
		$request      = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'sourceUrl' => $source_url,
				)
			)
		);
		$response = rest_do_request( $request );
		$post_id  = $response->get_data()['id'];

		// do a look up, so that it gets cached
		$request = new WP_REST_Request( 'GET', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_query_params(
			array(
				'sourceurl' => $source_url,
			)
		);

		rest_do_request( $request );

		// Verify cache was set
		$this->assertEquals( $post_id, wp_cache_get( $cache_key, $cache_group ) );

		// Delete the post
		wp_delete_post( $post_id );

		// Verify the cache was cleared
		$this->assertFalse( wp_cache_get( $cache_key, $cache_group ) );
	}
}

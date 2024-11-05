<?php

use DotOrg\TryWordPress\Blogpost_Controller;
use PHPUnit\Framework\TestCase;

class Blogpost_Controller_Test extends TestCase {
	private string $namespace    = 'try-wp/v1';
	private string $subject_type = 'blogpost';
	private Blogpost_Controller $blogpost_controller;

	protected function setUp(): void {
		parent::setUp();

		$storage_post_type = 'lib_1';

		$this->blogpost_controller = new Blogpost_Controller( $storage_post_type );
	}

	public function testRegisterRoutes(): void {
		do_action( 'rest_api_init' ); // so that register_route() executes.

		$routes = rest_get_server()->get_routes( $this->namespace );
		$this->assertArrayHasKey( '/' . $this->namespace . '/blogpost', $routes );
		$this->assertArrayHasKey( '/' . $this->namespace . '/blogpost/(?P<id>\d+)', $routes );
		$this->assertArrayHasKey( '/' . $this->namespace . '/blogpost/schema', $routes );
	}

	public function testSchemaEndpoint() {
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type . '/schema';

		$request  = new WP_REST_Request( 'GET', $api_endpoint );
		$response = rest_do_request( $request );

		$schema = $this->blogpost_controller->get_item_schema();
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
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;

		$request = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$response = rest_do_request( $request );

		$this->assertEquals( 400, $response->get_status() );
	}

	public function testCreateItemMinimalBody() {
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;
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

	public function testCreateItemFullBody() {
		$date         = '2000-10-25 18:39:03';
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;
		$source_url   = 'https://example.org/2';
		$post_title   = 'This is an awesome post title';
		$post_content = 'This is an awesome post body';
		$author_id    = 23;

		$request = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'sourceUrl' => $source_url,
					'title'     => $post_title,
					'content'   => $post_content,
					'date'      => $date,
					'authorId'  => $author_id,
				)
			)
		);
		$response = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );
		$response_data = $response->get_data();

		$this->assertEquals( 6, $response_data['id'] );
		$this->assertEquals( $author_id, $response_data['authorId'] );
		$this->assertEquals( $post_title, $response_data['title'] );
		$this->assertEquals( $post_content, $response_data['content'] );
		$this->assertEquals( $date, $response_data['date'] );
		$this->assertEquals( $source_url, $response_data['sourceUrl'] );

		$this->assertNotEmpty( $response_data['previewUrl'] );

		// read from db
		$post = get_post( $response_data['id'] );
		$this->assertEquals( $source_url, $post->guid );
		$this->assertEquals( $post_title, $post->post_title );
		$this->assertEquals( $post_content, $post->post_content );
		$this->assertEquals( $author_id, $post->post_author );
		$this->assertEquals( $date, $post->post_date );
	}

	public function testCreateItemMissingSourceUrl() {
		$date         = '2000-10-25 18:39:03';
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;
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
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;
		$source_url   = 'https://example.org/original';
		$request      = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'sourceUrl' => $source_url,
					'title'     => 'Original Title',
					'content'   => 'Original Content',
				)
			)
		);
		$response = rest_do_request( $request );
		$post_id  = $response->get_data()['id'];

		// Now update the post
		$update_endpoint = '/' . $this->namespace . '/' . $this->subject_type . '/' . $post_id;
		$new_title       = 'Updated Title';
		$new_content     = 'Updated Content';

		$request = new WP_REST_Request( 'PUT', $update_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'title'     => $new_title,
					'content'   => $new_content,
					'sourceUrl' => $source_url,
				)
			)
		);
		$response = rest_do_request( $request );
		$this->assertEquals( 200, $response->get_status() );
		$response_data = $response->get_data();

		// Verify response data
		$this->assertEquals( $post_id, $response_data['id'] );
		$this->assertEquals( $new_title, $response_data['title'] );
		$this->assertEquals( $new_content, $response_data['content'] );
		$this->assertEquals( $source_url, $response_data['sourceUrl'] );

		// Verify database update
		$post = get_post( $post_id );
		$this->assertEquals( $new_title, $post->post_title );
		$this->assertEquals( $new_content, $post->post_content );
		$this->assertEquals( $source_url, $post->guid );
	}

	public function testDeleteItem() {
		// First create a post to delete
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;
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
		$delete_endpoint = '/' . $this->namespace . '/' . $this->subject_type . '/' . $post_id;
		$request         = new WP_REST_Request( 'DELETE', $delete_endpoint );
		$response        = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertTrue( $response->get_data() );

		// Verify post is in trash
		$post = get_post( $post_id );
		$this->assertEquals( 'trash', $post->post_status );
	}

	public function testDeleteNonexistentItem() {
		$delete_endpoint = '/' . $this->namespace . '/' . $this->subject_type . '/99999';
		$request         = new WP_REST_Request( 'DELETE', $delete_endpoint );
		$response        = rest_do_request( $request );

		$this->assertEquals( 404, $response->get_status() );
	}

	public function testFindBySourceUrlNoArgs() {
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;
		$request      = new WP_REST_Request( 'GET', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );

		$response = rest_do_request( $request );

		$this->assertEquals( 400, $response->get_status() );
	}

	public function testFindBySourceUrlNoUrl() {
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;
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
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;
		$request      = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'sourceUrl' => 'https://example.org/lookmeup',
				)
			)
		);
		$response = rest_do_request( $request );
		$post_id  = $response->get_data()['id'];

		$request = new WP_REST_Request( 'GET', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_query_params(
			array(
				'sourceurl' => 'https://example.org/lookmeup',
			)
		);

		$response = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( $post_id, $response->get_data()['id'] );
	}

	public function testFindBySourceUrlInvalidUrl() {
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;
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
		$sourceUrl   = 'https://example.org/guidcachetesting';
		$cache_group = 'try_wp';
		$cache_key   = 'try_wp_cache_guid_' . md5( $sourceUrl );

		// First create a post
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;
		$request      = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$request->set_body(
			wp_json_encode(
				array(
					'sourceUrl' => $sourceUrl,
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
				'sourceurl' => $sourceUrl,
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

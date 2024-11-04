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

	public function test_schema_endpoint() {
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

	public function test_create_item_no_body() {
		$api_endpoint = '/' . $this->namespace . '/' . $this->subject_type;

		$request = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_header( 'Content-Type', 'application/json' );
		$response = rest_do_request( $request );

		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_create_item_minimal_body() {
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

	public function test_create_item_full_body() {
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
}

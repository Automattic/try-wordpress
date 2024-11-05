<?php

use DotOrg\TryWordPress\Liberate_Controller;
use PHPUnit\Framework\TestCase;

class Liberate_Controller_Test extends TestCase {
	private string $storage_post_type = 'lib_2';
	private string $date              = '2000-10-25 18:39:03';
	private string $inserted_post_id;
	private Liberate_Controller $liberate_controller;

	protected function setUp(): void {
		parent::setUp();
		$this->liberate_controller = new Liberate_Controller( $this->storage_post_type );
		$this->inserted_post_id    = wp_insert_post(
			array(
				'post_title' => 'hello unit tests',
				'post_type'  => $this->storage_post_type,
			)
		);
	}

	public function testGetStoragePostType() {
		$this->assertEquals( $this->storage_post_type, $this->liberate_controller->get_storage_post_type() );
	}

	public function testValidRequestForUpdateRule1() {
		// invalid id, rule 1 violation
		$api_endpoint = '/try-wp/v1/blogpost/9999';
		$request      = new WP_REST_Request( 'POST', $api_endpoint );
		$request->set_body(
			wp_json_encode(
				array(
					'title' => 'Some title',
				)
			)
		);
		rest_do_request( $request );

		$result = $this->liberate_controller->valid_request_for_update( $request );
		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertEquals( 'rest_post_invalid_id', $result->get_error_code() );
	}

	public function testValidRequestForUpdateRule2() {
		// attempting to update sourceUrl/guid, rule 2 violation
		$api_endpoint = '/try-wp/v1/blogpost/' . $this->inserted_post_id;
		$request      = new WP_REST_Request( 'PUT', $api_endpoint );
		$request->set_body(
			wp_json_encode(
				array(
					'title'     => 'Updated title',
					'sourceUrl' => 'https://example.org/different',
				)
			)
		);
		rest_do_request( $request );

		$result = $this->liberate_controller->valid_request_for_update( $request );
		$this->assertInstanceOf( 'WP_Error', $result );
		$this->assertEquals( 'rest_source_url_immutable', $result->get_error_code() );
	}

	public function testValidRequestForUpdateSuccess() {
		// valid id and same sourceUrl specified
		$request = new WP_REST_Request( 'POST', '/try-wp/v1/blogpost/' . $this->inserted_post_id );
		$request->set_query_params( array( 'id' => $this->inserted_post_id ) );
		$request->set_body(
			wp_json_encode(
				array(
					'title'     => 'Some title',
					'sourceUrl' => get_permalink( $this->inserted_post_id ),
				)
			)
		);
		rest_do_request( $request );

		$this->assertTrue( $this->liberate_controller->valid_request_for_update( $request ) );
	}

	public function testPrepareItemForResponse() {
		// Note: Not all fields are currently used, so we only look up for fields that we do use
		// When we start using a new field, this test would fail and require an update :)
		$post_array = array(
			'ID'                    => 23,
			'post_author'           => 42,
			'post_date'             => $this->date,
			'post_date_gmt'         => $this->date,
			'post_content'          => 'This is the test content',
			'post_title'            => 'This is the test title',
			'post_excerpt'          => 'This is the test excerpt',
			'post_status'           => 'publish',
			'comment_status'        => 'closed',
			'ping_status'           => 'closed',
			'post_password'         => '',
			'post_name'             => '',
			'to_ping'               => '',
			'pinged'                => $this->date,
			'post_modified'         => $this->date,
			'post_modified_gmt'     => $this->date,
			'post_content_filtered' => '',
			'post_parent'           => 0,
			'guid'                  => 'https://example.org/78',
			'menu_order'            => 0,
			'post_type'             => $this->liberate_controller->get_storage_post_type(),
			'comment_count'         => 0,
		);

		$result = $this->liberate_controller->prepare_item_for_response(
			$post_array,
			new WP_REST_Request()
		);

		$this->assertEquals(
			array(
				'id'        => 23,
				'authorId'  => 42,
				'title'     => 'This is the test title',
				'content'   => 'This is the test content',
				'date'      => $this->date,
				'sourceUrl' => 'https://example.org/78',
			),
			$result->get_data()
		);
	}

	public function testPrepareItemForDatabase() {
		$request = new WP_REST_Request( 'GET', '/whatever' );
		$request->set_body(
			wp_json_encode(
				array(
					'title'     => 'This is the test title',
					'content'   => 'This is the test content',
					'sourceUrl' => get_permalink( $this->inserted_post_id ),
					'date'      => $this->date,
				)
			)
		);
		rest_do_request( $request );

		$result = $this->liberate_controller->prepare_item_for_database( $request );
		$this->assertEquals( $this->liberate_controller->get_storage_post_type(), $result['post_type'] );
		$this->assertEquals( 'This is the test title', $result['post_title'] );
		$this->assertEquals( 'This is the test content', $result['post_content'] );
		$this->assertEquals( get_permalink( $this->inserted_post_id ), $result['guid'] );
		$this->assertEquals( $this->date, $result['post_date'] );
	}
}

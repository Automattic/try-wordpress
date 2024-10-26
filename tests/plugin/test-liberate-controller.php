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
			)
		);
	}

	public function testGetStoragePostType() {
		$this->assertEquals( $this->storage_post_type, $this->liberate_controller->get_storage_post_type() );
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
					'sourceUrl' => 'https://example.org/70',
					'date'      => $this->date,
				)
			)
		);

		// test create attempt
		$result = $this->liberate_controller->prepare_item_for_database( $request );
		$this->assertEquals( $this->liberate_controller->get_storage_post_type(), $result['post_type'] );
		$this->assertEquals( 'This is the test title', $result['post_title'] );
		$this->assertEquals( 'This is the test content', $result['post_content'] );
		$this->assertEquals( 'https://example.org/70', $result['guid'] );
		$this->assertEquals( $this->date, $result['post_date'] );

		// test update attempt - valid id
		$request->set_query_params( array( 'id' => $this->inserted_post_id ) );
		$result = $this->liberate_controller->prepare_item_for_database( $request );
		$this->assertEquals( $this->inserted_post_id, $result['ID'] );

		// test update attempt - invalid id
		$request->set_query_params( array( 'id' => 9999 ) );
		$result = $this->liberate_controller->prepare_item_for_database( $request );
		$this->assertInstanceOf( 'WP_Error', $result );
	}
}

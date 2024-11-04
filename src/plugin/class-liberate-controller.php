<?php

namespace DotOrg\TryWordPress;

use WP_Error;
use WP_REST_Controller;
use WP_REST_Response;

class Liberate_Controller extends WP_REST_Controller {

	protected string $storage_post_type;

	public function __construct( $storage_post_type ) {
		$this->storage_post_type = $storage_post_type;
	}

	public function get_storage_post_type(): string {
		return $this->storage_post_type;
	}

	public function prepare_item_for_response( $item, $request ): WP_REST_Response|WP_Error {
		$response = array(
			'id'        => $item['ID'] ?? '',
			'authorId'  => $item['post_author'] ?? '',
			'title'     => $item['post_title'] ?? '',
			'content'   => $item['post_content'] ?? '',
			'date'      => $item['post_date'] ?? '',
			'sourceUrl' => $item['guid'] ?? '',
		);

		if ( ! empty( $item['ID'] ) ) {
			$transformed_post = get_post_meta( $item['ID'], '_dl_transformed', true );
			if ( $transformed_post ) {
				$response['previewUrl'] = get_post_permalink( $transformed_post );
			}
		}

		return new WP_REST_Response( $response );
	}

	public function prepare_item_for_database( $request ): WP_Error|array {
		$prepared_post = array();

		// Check if we're doing an update, we have a valid post id to work with
		if ( isset( $request['id'] ) ) {
			$existing_post = get_post( $request['id'] );
			if ( is_null( $existing_post ) ) {
				return new WP_Error(
					'rest_invalid_id',
					__( 'Invalid ID.', 'try_wordpress' ),
					array( 'status' => 400 )
				);
			}
			$prepared_post['ID'] = $request['id'];
		}

		$request_data = json_decode( $request->get_body(), true );

		// Prepare $postarr that can be passed to wp_insert_post()
		$prepared_post['post_type']    = $this->storage_post_type;
		$prepared_post['post_title']   = $request_data['title'] ?? '';
		$prepared_post['post_content'] = $request_data['content'] ?? '';
		$prepared_post['guid']         = $request_data['sourceUrl'] ?? '';
		$prepared_post['post_date']    = $request_data['date'] ?? '';
		$prepared_post['post_author']  = $request_data['authorId'] ?? '';

		return $prepared_post;
	}
}

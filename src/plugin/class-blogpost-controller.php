<?php

namespace DotOrg\TryWordPress;

use WP_Error;
use WP_REST_Response;
use WP_REST_Server;

class Blogpost_Controller extends Liberate_Controller {

	public function __construct( $storage_post_type ) {
		parent::__construct( $storage_post_type );

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
		$this->attach_filters();
	}

	// @TODO: This function can become register_liberation_routes and be moved to Liberate_Controller
	// register_liberation_routes( $namespace, $subject_type )
	public function register_routes(): void {
		$version      = '1';
		$namespace    = 'try-wp/v' . $version;
		$subject_type = 'blogpost';
		register_rest_route(
			$namespace,
			'/' . $subject_type,
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => '__return_true',
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
				),
			)
		);
		register_rest_route(
			$namespace,
			'/' . $subject_type . '/(?P<id>\d+)',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => '__return_true',
					'args'                => array(
						'context' => array(
							'default' => 'view',
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => '__return_true',
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::EDITABLE ),
				),
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => '__return_true',
					'args'                => array(
						'force' => array(
							'default' => false,
						),
					),
				),
			)
		);
		register_rest_route(
			$namespace,
			'/' . $subject_type . '/schema',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_public_item_schema' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	public function attach_filters(): void {
		add_filter(
			'wp_insert_post_empty_content',
			function ( $maybe_empty, $postarr ) {
				if ( $postarr['post_type'] === $this->storage_post_type ) {
					return false;
				}
				return $maybe_empty;
			},
			10,
			2
		);
	}

	public function get_item_schema(): array {
		if ( $this->schema ) {
			return $this->schema;
		}

		$schema = array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'blogpost',
			'type'       => 'object',
			'properties' => array(
				'id'            => array(
					'description' => __( 'Unique identifier for liberated blogpost', 'try_wordpress' ),
					'type'        => 'integer',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
				'title'         => array(
					'description' => __( 'Title of the liberated blogpost', 'try_wordpress' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'required'    => false,
					'arg_options' => array(
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
				'date'          => array(
					'description' => __( 'Published datetime of the liberated blogpost', 'try_wordpress' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'required'    => false,
					'arg_options' => array(
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
				'content'       => array(
					'description' => __( 'Content of the liberated blogpost', 'try_wordpress' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'required'    => false,
					'arg_options' => array(
						'sanitize_callback' => 'sanitize_text_field', // we don't want to modify any HTML
					),
				),
				'sourceUrl'     => array(
					'description' => __( 'Source URL from where the blogpost was liberated', 'try_wordpress' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'required'    => true,
					'arg_options' => array(
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
				'transformedId' => array(
					'description' => __( 'Post ID of transformed result of this liberated blogpost', 'try_wordpress' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'required'    => false,
					'arg_options' => array(
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			),
		);

		$this->schema = $schema;
		return $this->schema;
	}

	public function get_item( $request ): WP_REST_Response|WP_Error {
		$post_id = $request['id'];
		$item    = get_post( $post_id, ARRAY_A );
		if ( is_null( $item ) ) {
			return new WP_Error(
				'rest_post_invalid_id',
				__( 'Invalid post ID.', 'try_wordpress' ),
				array( 'status' => 404 )
			);
		}

		return $this->prepare_item_for_response( $item, $request );
	}

	public function create_item( $request ): WP_REST_Response|WP_Error {
		$item = $this->prepare_item_for_database( $request );

		$result = wp_insert_post( $item, true );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$item['ID'] = $result;

		return $this->prepare_item_for_response( $item, $request );
	}

	public function update_item( $request ): WP_REST_Response|WP_Error {
		$item = $this->prepare_item_for_database( $request );

		$result = wp_insert_post( $item, true );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return $this->prepare_item_for_response( $item, $request );
	}

	public function delete_item( $request ): WP_Error|WP_REST_Response {
		$post_id = $request['id'];

		$item = get_post( $post_id );
		if ( is_null( $item ) ) {
			return new WP_Error(
				'rest_post_invalid_id',
				__( 'Invalid post ID.', 'try_wordpress' ),
				array( 'status' => 404 )
			);
		}

		if ( wp_trash_post( $request['id'] ) ) {
			return new WP_REST_Response( true, 200 );
		}

		return new WP_Error( 'rest_could_not_delete', __( 'Could not delete', 'try_wordpress' ), array( 'status' => 500 ) );
	}
}

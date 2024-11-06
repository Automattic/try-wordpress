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

	public function register_routes(): void {
		$version             = '1';
		$namespace           = 'try-wp/v' . $version;
		$subject_type_plural = 'blog-posts';
		register_rest_route(
			$namespace,
			'/' . $subject_type_plural,
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => '__return_true',
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::CREATABLE ),
				),
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'search_item' ),
					'permission_callback' => '__return_true',
					'args'                => $this->get_endpoint_args_for_item_schema( WP_REST_Server::READABLE ),
				),
			)
		);
		register_rest_route(
			$namespace,
			'/' . $subject_type_plural . '/(?P<id>\d+)',
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
			'/' . $subject_type_plural . '/schema',
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

		// Bust guid -> postId cache when a post is deleted
		add_filter(
			'delete_post_' . $this->storage_post_type,
			function ( $post_id, $post ) {
				$cache_group = 'try_wp';
				$cache_key   = 'try_wp_cache_guid_' . md5( $post->guid );

				wp_cache_delete( $cache_key, $cache_group );
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
		$item      = $this->prepare_item_for_database( $request );
		$item_meta = $item['meta'];
		unset( $item['meta'] );

		$result = wp_insert_post( $item, true );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$item['ID'] = $result;

		foreach ( $item_meta as $key => $value ) {
			update_post_meta( $item['ID'], $key, $value );
		}

		return $this->prepare_item_for_response( $item, $request );
	}

	public function update_item( $request ): WP_REST_Response|WP_Error {
		$valid_request_for_update = $this->valid_request_for_update( $request );
		if ( is_wp_error( $valid_request_for_update ) ) {
			return $valid_request_for_update;
		}

		$item      = $this->prepare_item_for_database( $request );
		$item_meta = $item['meta'];
		unset( $item['meta'] );

		$result = wp_insert_post( $item, true );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		foreach ( $item_meta as $key => $value ) {
			update_post_meta( $item['ID'], $key, $value );
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

	public function search_item( $request ): WP_Error|WP_REST_Response {
		$guid = $request['sourceurl'] ?? '';

		if ( empty( $guid ) ) {
			return new WP_Error(
				'rest_search_invalid_sourceurl',
				__( 'Invalid source URL.', 'try_wordpress' ),
				array( 'status' => 400 )
			);
		}

		// Use wp_cache_* for guid -> postId
		$cache_group = 'try_wp';
		$cache_key   = 'try_wp_cache_guid_' . md5( $guid );
		$post_id     = wp_cache_get( $cache_key, $cache_group );

		if ( false !== $post_id ) {
			// Cache hit - get post using WordPress API
			$post = get_post( $post_id, ARRAY_A );
			if ( $post ) {
				return $this->prepare_item_for_response( $post, $request );
			}
			// If post not found despite cache hit, delete the cache
			wp_cache_delete( $cache_key, $cache_group );
		}

		// Cache miss - query database
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
		$post = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM $wpdb->posts WHERE guid = %s",
				$guid
			),
			ARRAY_A
		);

		if ( $post ) {
			// Cache the post ID for future lookups
			wp_cache_set( $cache_key, $post['ID'], $cache_group, YEAR_IN_SECONDS );
			return $this->prepare_item_for_response( $post, $request );
		}

		return new WP_Error(
			'rest_not_found',
			__( 'Not found', 'try_wordpress' ),
			array( 'status' => 404 )
		);
	}
}

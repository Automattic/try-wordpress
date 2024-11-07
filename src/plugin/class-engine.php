<?php

namespace DotOrg\TryWordPress;

class Engine {

	private string $storage_post_type = 'liberated_data';

	public function __construct() {
		require 'class-post-type-ui.php';
		require 'class-promoter.php';
		require 'class-meta-fields-manager.php';
		require 'class-rest-api-extender.php';
		require 'class-liberate-controller.php';
		require 'class-blogpost-controller.php';
		require 'class-storage.php';

		( function () {
			$promoter = new Promoter( $this->storage_post_type );

			new Post_Type_UI( $this->storage_post_type, $promoter );
			new Meta_Fields_Manager( $this->storage_post_type );

			// REST API
			new Blogpost_Controller( $this->storage_post_type );
			new Rest_API_Extender( $this->storage_post_type, $promoter );

			new Storage( $this->storage_post_type );
		} )();
	}
}

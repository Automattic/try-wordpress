<?php

namespace DotOrg\TryWordPress;

class Engine {

	public const string STORAGE_POST_TYPE = 'liberated_data';

	public function __construct() {
		require 'enum-subject-type.php';

		require 'class-transformers-registry.php';
		require 'class-post-type-ui.php';
		require 'class-transformer.php';
		require 'class-subjects-controller.php';
		require 'class-storage.php';
		require 'class-schema.php';
		require 'utils.php';
		require 'class-subject.php';
		require 'class-ops.php';

		( function () {
			new Transformer();
			new Post_Type_UI( self::STORAGE_POST_TYPE );

			// REST API
			new Subjects_Controller( self::STORAGE_POST_TYPE );

			new Storage( self::STORAGE_POST_TYPE );

			Ops::init( self::STORAGE_POST_TYPE );
		} )();
	}
}

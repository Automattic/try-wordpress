<?php

namespace DotOrg\TryWordPress;

class Engine {

	public const string STORAGE_POST_TYPE = 'liberated_data';

	public function __construct() {
		require 'enum-subject-type.php';
		require 'class-subject.php';
		require 'class-schema.php';

		require 'class-handlers-registry.php';
		require 'class-observers-registry.php';

		require 'class-subjects-controller.php';

		require 'class-storage.php';

		require 'class-post-type-ui.php';
		require 'class-transformer.php';
		require 'class-ops.php';

		require 'utils.php';

		( function () {
			new Transformer();
			new Post_Type_UI( self::STORAGE_POST_TYPE );

			// REST API
			new Subjects_Controller( self::STORAGE_POST_TYPE );

			new Storage( self::STORAGE_POST_TYPE );

			Ops::init( self::STORAGE_POST_TYPE );

			/**
			 * Handle mimicry of WordPress-y API for developers
			 *
			 * There are no `do_action( 'data_liberated_' . %subjectype% )` calls anywhere
			 * We loop over any registered callbacks and invoke Ops::handle on their behalf
			 */
			add_action(
				'init',
				function () {
					global $wp_filter;
					foreach ( SubjectType::cases() as $type ) {
						$hook_name = 'data_liberated_' . $type->value;
						if ( isset( $wp_filter[ $hook_name ] ) ) {
							foreach ( $wp_filter[ $hook_name ]->callbacks as $callbacks ) {
								foreach ( $callbacks as $callback ) {
									Ops::handle(
										$type,
										array(
											'slug'        => 'wp_action_' . wp_generate_uuid4(),
											'description' => 'Handler registered via WordPress action',
										),
										$callback['function']
									);
								}
							}
						}
					}
				},
				PHP_INT_MAX
			);
		} )();
	}
}

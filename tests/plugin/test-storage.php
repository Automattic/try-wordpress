<?php

use DotOrg\TryWordPress\Storage;
use PHPUnit\Framework\TestCase;

class Storage_Test extends TestCase {
	private Storage $storage;

	protected function setUp(): void {
		parent::setUp();
		$this->storage = new Storage( 'lib_x' );
	}

	public function testRegisterPostTypes(): void {
		$this->assertTrue( post_type_exists( 'lib_x' ), 'Custom post type meant for storage not registered' );
	}
}

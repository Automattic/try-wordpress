<?php
/**
 * Plugin Name: Try WordPress
 * Description: Try WordPress REST API.
 * Version: 0.0.1
 * Author: WordPress.org
 */

namespace DotOrg\TryWordPress;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require 'class-engine.php';

new Engine();

# Receive Liberated Data

## Definitions

Each identified piece of content is referred to as
a [subject](src/plugin/class-subject.php), and hence has
a [subject type](src/plugin/enum-subject-type.php).

The act of extracting data is referred to as `liberation` and the act of using the extracted raw data to convert into a
usable form is referred to as `transformation` throughout the documentation and code.

While liberating data, we always store the raw data that we are handling in hopes of running a better transformation in
the future or any third-party plugin to transform the data upon installation of their plugin.

## Storage Architecture

Try WordPress stores all liberated data in a custom post type called `liberated_data`, exposed via a constant:
`\DotOrg\TryWordPress\Engine::STORAGE_POST_TYPE`.

We maintain references between the source data and transformed output using two post meta keys:

- `_data_liberation_source`: Points to the source content (exposed via
  `\DotOrg\TryWordPress\Transformer::META_KEY_LIBERATED_SOURCE`)
- `_data_liberation_output`: Points to the transformed output (exposed via
  `\DotOrg\TryWordPress\Transformer::META_KEY_LIBERATED_OUTPUT`)

This two-way reference allows both Try WordPress and your plugin to track relationships between original content and
transformed posts.

However, we recommend integrating using our hook below:

## Integration

If your plugin is available during data liberation, it can register handlers for the desired subject types and run its
own transformations.

You can either use `Ops::handle()` to register a handler for your desired subject type or use our WordPress hook
`data_liberated_{$subject_type}` action hook which would invoke `Ops::handle()` on your behalf. You must return the post
ID of your transformed post from your handler for the preview to show up correctly.

In your handler, you get access to the raw data through an instance of the Subject class.

The [Subject class](src/plugin/class-subject.php) provides a clean API to access raw data and existing transformed
output:

### Code examples:

For example, to transform "product" (subject type) data into your custom product post type, you would do this:

`\DotOrg\TryWordPress\Ops::handle( SubjectType::PRODUCT->value', 'myplugin_unique_slug_product_handler' );`

OR

`add_action( 'data_liberated_product', 'myplugin_unique_slug_product_handler' );`

where your handler function would look something like this:

```php
function myplugin_unique_slug_product_handler( $subject ) {
    // process raw data
    $title   = $subject->title;
    $date    = $subject->date;
    $content = $subject->content;
    
    // access the entire HTML source of page or its URL
    // $subject->source_html
    // $subject->source_url
    
    // Create a product in your custom post type
    $my_product_id = wp_insert_post( array(
        'post_type'    => 'my_product_type',
        'post_title'   => $title,
        'post_date'    => $date,
        'post_content' => $content,
        'post_status'  => 'publish',
    ) );
    
    return $my_product_id; // would be used for preview
}
```

## Best Practices

1. Always use the Subject class's public API to access liberated data. Don't rely on internal implementation details.

## Need Help?

Open an issue on our [GitHub repository](https://github.com/WordPress/try-wordpress) if you:

- Need additional integration points
- Have a use case not currently covered
- Want to discuss your integration approach

We actively work with plugin authors to ensure Try WordPress meets real-world needs.

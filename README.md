# Google Tag Manager Implementation for Shopify

This snippet should serve as a good generic starting point for shop owners working to integrate Google Analytics (GA4) via Google Tag Manager (GTM) into their Shopify store.

## Note on testing

[Shopify custom pixels](https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/code) create a sandboxed environment with access to [standard events](https://shopify.dev/docs/api/web-pixels-api/standard-events). The sandboxed environment runs pixel code in an HTML `<iframe>`, which does not play well with GTM's Tag Assistant. As a result, confirming the installation and debugging may be a bit of a challenge. My approach has been to add `console.log` calls with the `dataLayer` object and check the developer console.

## Installation

### Shopify custom pixel

Create a [Shopify custom pixel](https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/code) using the code in [shopify-pixel.js](./shopify-pixel.js).

> [!IMPORTANT]
> Be sure to replace the generic `GTM-XXXXXXX` value with your GTM container ID.

> [!NOTE]
> Your theme may override functionality, which may interfere with the execution of default Shopify events. Be sure to test your theme.

### Prepare GTM

1. Add a GA4 tag to your GTM container.
2. Add triggers for the following events:
   - `purchase`
   - `add_payment_info`
   - `add_address_info`
   - `add_shipping_info`
   - `add_contact_info`
   - `begin_checkout`
   - `remove_from_cart`
   - `view_cart`
   - `add_to_cart`
   - `view_item`
   - `view_item_list`
   - `search`
   - `page_view`

### Optional: Add more `Shopify.analytics.publish()` calls to your theme

There may be certain scenarios where you would want to track events that Shopify does not provide by default. You can add these to your theme by implementing calls like this:

```javascript
Shopify.analytics.publish('custom_event', {
  event: 'event_name',
  key1: 'value1',
  key2: 'value2'
});
```

You are free the change the value of `event`, and the key-value pairs, of course.

## Credits

- All credits for the foundation of this pixel go to <https://github.com/lstellway/snippets>

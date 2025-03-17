# Shopify - Google Tag Manager Implementation

This snippet should serve as a good generic starting point for shop owners working to integrate Google Analytics via Google Tag Manager into their Shopify store.

## Note on testing

[Shopify custom pixels](https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/code) create a sandboxed environment with access to [Shopify analytics standard events](https://shopify.dev/docs/api/web-pixels-api/standard-events). The sandboxed environment runs pixel code in an HTML `<iframe>`, which does not play well with Google Tag Manager's Tag Assistant. As a result, confirming the installation and debugging may be a bit of a challenge. My approach has been to add `console.log` calls with the `dataLayer` object and check the developer console.

## Installation

### Shopify custom pixel

Create a [Shopify custom pixel](https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/code) using the code in [shopify-pixel.js](./shopify-pixel.js).

> [!IMPORTANT]
> Be sure to replace the generic `GTM-XXXXXXX` value with your Google Tag Manager container ID.

> [!NOTE]
> Your theme may override functionality, which may interfere with the execution of default Shopify events. Be sure to test your theme.

### Prepare Google Tag Manager

1. Add a GA4 tag to your Google Tag Manager container.
2. Add triggers for the following events:
   - `purchase`

### Optional: Add more `dataLayer.push` calls to your theme

There may be certain scenarios where you may need access to data that default Shopify events do not provide. In these cases, you may want to install Google Tag Manager into your theme the traditional way. (Refer to the [Google documentation](https://support.google.com/tagmanager/answer/6103696?hl=en).)

## Credits

- All credits for the foundation of this pixel go to <https://github.com/lstellway/snippets>

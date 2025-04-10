(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != "dataLayer" ? "&l=" + l : "";
  j.async = true;
  j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, "script", "dataLayer", "GTM-XXXXXXX");

/**
 * Convert Shopify item to GA4 item for checkout events
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_started
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#begin_checkout_item
 * @param {object} item - The item object
 * @param {number} index - The index of the item
 * @returns {object} - The GA4 item object
 */
function shopifyCheckoutLineItemToGA4Item(item, index) {
  var data = {
    affiliation: null,
    index: index,
    item_brand: item.variant.product.vendor,
    item_category: item.variant.product.type,
    item_category2: null,
    item_category3: null,
    item_category4: null,
    item_category5: null,
    item_id: item.variant.product.id,
    item_name: item.title, // Not item.variant.product.title
    item_type: item.variant.product.type,
    item_variant: item.variant.title,
    item_variant_id: item.variant.id,
    item_variant_sku: item.variant.sku,
    price: item.variant.price.amount,
    quantity: item.quantity,
  };

  if (item.variant.title) {
    var titleSplit = item.variant.title.split(" / ");
    data.item_category2 = titleSplit[0] || null;
    data.item_category3 = titleSplit[1] || null;
    data.item_category4 = titleSplit[2] || null;
    data.item_category5 = titleSplit[3] || null;
  }

  var discountAllocations = item.discountAllocations || [];

  data.coupon = discountAllocations
    .map(function (discountAllocation) {
      return discountAllocation.discountApplication.title;
    })
    .join(",");

  data.discount = discountAllocations.reduce(function (
    total,
    discountAllocation,
  ) {
    return total + discountAllocation.amount.amount;
  }, 0);

  var properties = item.properties || [];
  for (var i = 0; i < properties.length; i++) {
    data["item_property_" + properties[i].key] = properties[i].value;
  }

  return data;
}

/**
 * Convert Shopify productVariant to GA4 item
 * @param {object} Shopify productVariant
 * @param {number} index
 * @returns {object} GA4 item
 */
function shopifyProductVariantToGA4Item(productVariant, index) {
  var data = {
    affiliation: null,
    item_brand: productVariant.product.vendor,
    item_category: productVariant.product.type,
    item_category2: null,
    item_category3: null,
    item_category4: null,
    item_category5: null,
    item_id: productVariant.product.id,
    item_name: productVariant.product.title,
    item_type: productVariant.product.type,
    item_variant: productVariant.title,
    item_variant_id: productVariant.id,
    item_variant_sku: productVariant.sku,
    price: productVariant.price.amount,
  };

  if (index) {
    data.index = index;
  }

  if (productVariant.title) {
    var titleSplit = productVariant.title.split(" / ");
    data.item_category2 = titleSplit[0] || null;
    data.item_category3 = titleSplit[1] || null;
    data.item_category4 = titleSplit[2] || null;
    data.item_category5 = titleSplit[3] || null;
  }

  return data;
}

/**
 * Convert Shopify item to GA4 item for cart events
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/product_added_to_cart
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#add_to_cart_item
 * @param {object} cartLine - The cart line item to convert
 * @returns {object} - The GA4 item object
 */
function shopifyCartLineToGA4Item(cartLine) {
  var productVariant = cartLine.merchandise;
  var data = shopifyProductVariantToGA4Item(productVariant);

  data.price = cartLine.cost.totalAmount.amount;
  data.quantity = cartLine.quantity;

  return data;
}
/**
 * Generate a GA4 dataLayer from a Shopify checkout event
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_started
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#begin_checkout
 * @param {string} event_name - The name of the event
 * @param {object} event - The event object
 * @returns {object} - The GA4 dataLayer object
 */
function checkoutEventToDataLayer(event_name, event) {
  var checkout = event.data.checkout || {};
  var coupons = (checkout.discountApplications || [])
    .map(function (discountApplication) {
      return discountApplication.title;
    })
    .join(",");
  var items = (checkout.lineItems || []).map(shopifyCheckoutLineItemToGA4Item);
  var paymentMethods = (checkout.transactions || [])
    .map(function (transaction) {
      if (transaction.paymentMethod) {
        return transaction.paymentMethod.name || null;
      }
    })
    .join(",");
  var deliveryOptions =
    (checkout.delivery && checkout.delivery.selectedDeliveryOptions ? checkout.delivery.selectedDeliveryOptions : []) // prettier-ignore
      .map(function (deliveryOption) {
        return deliveryOption.title || null;
      })
      .join(",");

  return {
    checkout_token: checkout.token,
    ecommerce: {
      coupon: coupons,
      currency: checkout.currencyCode,
      items: items,
      payment_type: paymentMethods,
      shipping: checkout.shippingLine.price.amount,
      shipping_tier: deliveryOptions,
      subtotal: checkout.subtotalPrice.amount,
      tax: checkout.totalTax.amount,
      transaction_id: checkout.order.id,
      value: checkout.totalPrice.amount,
    },
    event: event_name,
    event_id: event.id,
    event_timestamp: event.timestamp,
    page_location: event.context.window.location.href,
    page_referrer: event.context.document.referrer,
    page_title: event.context.document.title,
    shopify_client_id: event.clientId,
    shopify_event_name: event.name,
    shopify_event_seq: event.seq,
    shopify_event_type: event.type,
    user_email: checkout.email,
    user_id: checkout.order.customer.id,
    user_logged_in: checkout.order.customer.id ? true : false,
    user_phone: checkout.phone,
  };
}

/**
 * Push checkout_completed as purchase
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_completed
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#purchase
 */
analytics.subscribe("checkout_completed", (event) => {
  data = checkoutEventToDataLayer("purchase", event);
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push payment_info_submitted as add_payment_info
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/payment_info_submitted
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#add_payment_info
 */
analytics.subscribe("payment_info_submitted", (event) => {
  data = checkoutEventToDataLayer("add_payment_info", event);
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push checkout_address_info_submitted (i.e. phone number) as add_address_info
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_address_info_submitted
 */
analytics.subscribe("checkout_address_info_submitted", (event) => {
  data = checkoutEventToDataLayer("add_address_info", event);
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push checkout_shipping_info_submitted (i.e. address) as add_shipping_info
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_shipping_info_submitted
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#add_shipping_info
 */
analytics.subscribe("checkout_shipping_info_submitted", (event) => {
  data = checkoutEventToDataLayer("add_shipping_info", event);
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push checkout_contact_info_submitted (i.e. email) as add_contact_info
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_contact_info_submitted
 */
analytics.subscribe("checkout_contact_info_submitted", (event) => {
  data = checkoutEventToDataLayer("add_contact_info", event);
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push checkout_started as begin_checkout
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_started
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#begin_checkout
 */
analytics.subscribe("checkout_started", (event) => {
  data = checkoutEventToDataLayer("begin_checkout", event);
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push product_removed_from_cart as remove_from_cart
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/product_removed_from_cart
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#remove_from_cart
 */
analytics.subscribe("product_removed_from_cart", (event) => {
  var cartLine = event.data.cartLine || {};

  var data = {
    ecommerce: {
      currency: cartLine.cost.totalAmount.currencyCode,
      value: cartLine.cost.totalAmount.amount,
      items: [shopifyCartLineToGA4Item(cartLine)],
    },
    event: "remove_from_cart",
    event_id: event.id,
    event_timestamp: event.timestamp,
    page_location: event.context.window.location.href,
    page_referrer: event.context.document.referrer,
    page_title: event.context.document.title,
    shopify_client_id: event.clientId,
    shopify_event_name: event.name,
    shopify_event_seq: event.seq,
    shopify_event_type: event.type,
  };
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push cart_viewed as view_cart
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/cart_viewed
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#view_cart
 */
analytics.subscribe("cart_viewed", (event) => {
  var cart = event.data.cart || {};
  var data = {
    cart_id: cart.id,
    ecommerce: {
      currency: cart.cost.totalAmount.currencyCode,
      value: cart.cost.totalAmount.amount,
      items: cart.lines.map(shopifyCartLineToGA4Item),
    },
    event: "view_cart",
    event_id: event.id,
    event_timestamp: event.timestamp,
    page_location: event.context.window.location.href,
    page_referrer: event.context.document.referrer,
    page_title: event.context.document.title,
    shopify_client_id: event.clientId,
    shopify_event_name: event.name,
    shopify_event_seq: event.seq,
    shopify_event_type: event.type,
  };
  var attributes = cart.attributes || [];
  for (var i = 0; i < attributes.length; i++) {
    data["cart_attribute_" + attributes[i].key] = attributes[i].value;
  }
  console.log(data);
  window.dataLayer.push(data);
});

/**
 * Push product_added_to_cart as add_to_cart
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/product_added_to_cart
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#add_to_cart
 */
analytics.subscribe("product_added_to_cart", (event) => {
  var cartLine = event.data.cartLine || {};

  var data = {
    ecommerce: {
      currency: cartLine.cost.totalAmount.currencyCode,
      value: cartLine.cost.totalAmount.amount,
      items: [shopifyCartLineToGA4Item(cartLine)],
    },
    event: "add_to_cart",
    event_id: event.id,
    event_timestamp: event.timestamp,
    page_location: event.context.window.location.href,
    page_referrer: event.context.document.referrer,
    page_title: event.context.document.title,
    shopify_client_id: event.clientId,
    shopify_event_name: event.name,
    shopify_event_seq: event.seq,
    shopify_event_type: event.type,
  };
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push product_viewed as view_item
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/product_viewed
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#view_item
 */
analytics.subscribe("product_viewed", (event) => {
  var productVariant = event.data.productVariant || {};

  var data = {
    ecommerce: {
      currency: productVariant.price.currencyCode,
      value: productVariant.price.amount,
      items: [shopifyProductVariantToGA4Item(productVariant)],
    },
    event: "view_item",
    event_id: event.id,
    event_timestamp: event.timestamp,
    page_location: event.context.window.location.href,
    page_referrer: event.context.document.referrer,
    page_title: event.context.document.title,
    shopify_client_id: event.clientId,
    shopify_event_name: event.name,
    shopify_event_seq: event.seq,
    shopify_event_type: event.type,
  };
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push collection_viewed as view_item_list
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/collection_viewed
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#view_item_list
 */
analytics.subscribe("collection_viewed", (event) => {
  var collection = event.data.collection || {};

  var data = {
    ecommerce: {
      currency: collection.productVariants[0] ? collection.productVariants[0].price.currencyCode : null, // prettier-ignore
      item_list_id: collection.id,
      item_list_name: collection.title,
      items: collection.productVariants.map(shopifyProductVariantToGA4Item),
    },
    event: "view_item_list",
    event_id: event.id,
    event_timestamp: event.timestamp,
    page_location: event.context.window.location.href,
    page_referrer: event.context.document.referrer,
    page_title: event.context.document.title,
    shopify_client_id: event.clientId,
    shopify_event_name: event.name,
    shopify_event_seq: event.seq,
    shopify_event_type: event.type,
  };
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push search_submitted as search
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/search_submitted
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#search
 */
analytics.subscribe("search_submitted", (event) => {
  var searchResult = event.data.searchResult || {};

  var data = {
    ecommerce: {
      currency: searchResult.productVariants[0] ? searchResult.productVariants[0].price.currencyCode : null, // prettier-ignore
      item_list_id: "search",
      item_list_name: "Search",
      items: searchResult.productVariants.map(shopifyProductVariantToGA4Item),
    },
    event: "search",
    event_id: event.id,
    event_timestamp: event.timestamp,
    page_location: event.context.window.location.href,
    page_referrer: event.context.document.referrer,
    page_title: event.context.document.title,
    search_term: searchResult.query,
    shopify_client_id: event.clientId,
    shopify_event_name: event.name,
    shopify_event_seq: event.seq,
    shopify_event_type: event.type,
  };
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push page_viewed as page_view
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/page_viewed
 * @see https://developers.google.com/analytics/devguides/collection/ga4/views?client_type=gtm#page_view_event
 */
analytics.subscribe("page_viewed", (event) => {
  data = {
    event: "page_view",
    event_id: event.id,
    event_timestamp: event.timestamp,
    page_location: event.context.window.location.href,
    page_referrer: event.context.document.referrer,
    page_title: event.context.document.title,
    shopify_client_id: event.clientId,
    shopify_event_name: event.name,
    shopify_event_seq: event.seq,
    shopify_event_type: event.type,
  };
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

/**
 * Push custom_event
 * @see https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/gtm-tutorial#replace-old-calls
 */
analytics.subscribe("custom_event", (event) => {
  data = event.customData;
  data.event_id = event.id;
  data.event_timestamp = event.timestamp;
  data.page_location = event.context.window.location.href;
  data.page_referrer = event.context.document.referrer;
  data.page_title = event.context.document.title;
  data.shopify_client_id = event.clientId;
  data.shopify_event_name = event.name;
  data.shopify_event_seq = event.seq;
  data.shopify_event_type = event.type;
  console.log("pushing to dataLayer:", data);
  window.dataLayer.push(data);
});

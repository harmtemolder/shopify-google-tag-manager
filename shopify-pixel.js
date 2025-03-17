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
    affiliation: "",
    index: index,
    item_brand: item.variant.product.vendor,
    item_category: "",
    item_category2: "",
    item_category3: "",
    item_category4: "",
    item_category5: "",
    item_id: item.id,
    item_name: item.title,
    item_variant: item.variant.title,
    item_variant_id: item.variant.id,
    item_variant_product: item.variant.product.title,
    item_variant_product_id: item.variant.product.id,
    item_variant_product_type: item.variant.product.type,
    item_variant_sku: item.variant.sku,
    price: item.variant.price.amount,
    quantity: item.quantity,
  };

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

  properties = item.properties || [];
  for (var i = 0; i < properties.length; i++) {
    data["item_property_" + properties[i].key] = properties[i].value;
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
  return {
    affiliation: "",
    item_brand: cartLine.merchandise.product.vendor,
    item_category: "",
    item_category2: "",
    item_category3: "",
    item_category4: "",
    item_category5: "",
    item_id: cartLine.merchandise.product.id,
    item_name: cartLine.merchandise.product.title,
    item_type: cartLine.merchandise.product.type,
    item_variant: cartLine.merchandise.title,
    item_variant_id: cartLine.merchandise.id,
    item_variant_sku: cartLine.merchandise.sku,
    price: cartLine.cost.totalAmount.amount,
    quantity: cartLine.quantity,
  };
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
      return transaction.paymentMethod.name;
    })
    .join(",");
  var deliveryOptions = (checkout.delivery.selectedDeliveryOptions || [])
    .map(function (deliveryOption) {
      return deliveryOption.title;
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
  dataLayer.push(data);
});

/**
 * Push checkout_started as begin_checkout
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_started
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#begin_checkout
 */
analytics.subscribe("checkout_started", (event) => {
  data = checkoutEventToDataLayer("begin_checkout", event);
  console.log("pushing to dataLayer:", data);
  dataLayer.push(data);
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
    page_title: event.context.document.title,
    shopify_client_id: event.clientId,
    shopify_event_name: event.name,
    shopify_event_seq: event.seq,
    shopify_event_type: event.type,
  };
  console.log("pushing to dataLayer:", data);
  dataLayer.push(data);
});

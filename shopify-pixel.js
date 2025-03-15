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
 * Convert Shopify item to GA4 item
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_started
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#begin_checkout_item
 * @param item CheckoutLineItem
 * @param index Number
 * @returns GA4Item
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
 * Push checkout_completed as purchase
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_completed
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#purchase
 */
analytics.subscribe("checkout_completed", (event) => {
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

  dataLayer.push({
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
    event: "purchase",
    event_id: event.id,
    event_timestamp: event.timestamp,
    page_location: event.context.window.location.href,
    page_title: event.context.document.title,
    shopify_client_id: event.clientId,
    shopify_event_name: event.name,
    shopify_event_seq: event.seq,
    shopify_event_type: event.type,
    user_email: checkout.email,
    user_id: checkout.customer.id,
    user_logged_in: checkout.customer.id ? true : false,
    user_phone: checkout.phone,
  });
});

/**
 * Push checkout_started as begin_checkout
 * @see https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_started
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#begin_checkout
 */
analytics.subscribe("checkout_started", (event) => {
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

  dataLayer.push({
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
    event: "begin_checkout",
    event_id: event.id,
    event_timestamp: event.timestamp,
    page_location: event.context.window.location.href,
    page_title: event.context.document.title,
    shopify_client_id: event.clientId,
    shopify_event_name: event.name,
    shopify_event_seq: event.seq,
    shopify_event_type: event.type,
    user_email: checkout.email,
    user_id: checkout.customer.id,
    user_logged_in: checkout.customer.id ? true : false,
    user_phone: checkout.phone,
  });
});

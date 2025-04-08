// https://developers.google.com/tag-platform/tag-manager/server-side/api
// https://developers.google.com/tag-platform/tag-manager/templates/standard-library

const claimRequest = require("claimRequest");
const getRequestBody = require("getRequestBody");
const getRequestHeader = require("getRequestHeader");
const getRequestPath = require("getRequestPath");
const JSON = require("JSON");
const logToConsole = require("logToConsole");
const returnResponse = require("returnResponse");
const runContainer = require("runContainer");
const setResponseBody = require("setResponseBody");
const setResponseHeader = require("setResponseHeader");
const setResponseStatus = require("setResponseStatus");

const requestPath = getRequestPath();
if (requestPath === data.requestPath) {
  claimRequest();

  const shopify = JSON.parse(getRequestBody());
  logToConsole("shopify =", shopify);

  let ga4 = {
    shopify: shopify, // TODO Remove after debugging
  };
  let response = {};

  const shopifyTopic = getRequestHeader("X-Shopify-Topic");
  if (shopifyTopic === "orders/create") {
    ga4 = {
      checkout_token: shopify.checkout_token,
      client_id: shopify.customer.id.toString(),
      coupon: null, // TODO
      currency: shopify.current_total_price_set.shop_money.currency_code,
      event_id: shopify.id.toString(),
      event_name: "purchase",
      event_timestamp: shopify.created_at,
      items: [], // TODO
      payment_type: null, // TODO
      shipping: shopify.current_shipping_price_set.shop_money.amount,
      shipping_tier: null, // TODO
      shopify_event_name: shopifyTopic,
      subtotal: shopify.current_subtotal_price_set.shop_money.amount,
      tax: shopify.current_total_tax_set.shop_money.amount,
      transaction_id: shopify.id.toString(),
      user_email: shopify.customer.email,
      user_id: shopify.customer.id.toString(),
      user_logged_in: shopify.customer.id ? true : false,
      user_phone: shopify.customer.phone,
      value: shopify.current_total_price_set.shop_money.amount,
    };
    response.message = "forwarded `orders/create` as `purchase`";
  } else {
    response.message = "forwarded without event_name";
  }

  response.event = ga4;

  const responseBody = JSON.stringify(response);
  setResponseBody(responseBody);
  setResponseHeader("Content-Type", "application/json");
  setResponseHeader("Content-Length", responseBody.length.toString());
  setResponseStatus(200);

  runContainer(ga4, () => returnResponse());
}

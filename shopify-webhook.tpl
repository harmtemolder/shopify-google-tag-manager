___TERMS_OF_SERVICE___

By creating or modifying this file you agree to Google Tag Manager's Community
Template Gallery Developer Terms of Service available at
https://developers.google.com/tag-manager/gallery-tos (or such other URL as
Google may provide), as modified from time to time.


___INFO___

{
  "type": "CLIENT",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "Shopify Webhook",
  "brand": {
    "id": "brand_dummy",
    "displayName": ""
  },
  "description": "Assumes version \u003cpre\u003e2025-01\u003c/pre\u003e.",
  "containerContexts": [
    "SERVER"
  ]
}


___TEMPLATE_PARAMETERS___

[
  {
    "type": "TEXT",
    "name": "requestPath",
    "displayName": "Request Path",
    "simpleValueType": true,
    "alwaysInSummary": true,
    "help": "Set to the path you\u0027ll use for Shopify\u0027s webhooks. The default is \u003cstrong\u003e/swh\u003c/strong\u003e, which means that a request to \u003cstrong\u003ehttps://your-gtm-server.com/swh\u003c/strong\u003e will activate the Client. Note that tests assume the default.",
    "defaultValue": "/swh",
    "valueValidators": [
      {
        "type": "REGEX",
        "args": [
          "^/[^?#]*$"
        ]
      }
    ]
  }
]


___SANDBOXED_JS_FOR_SERVER___

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


___SERVER_PERMISSIONS___

[
  {
    "instance": {
      "key": {
        "publicId": "logging",
        "versionId": "1"
      },
      "param": [
        {
          "key": "environments",
          "value": {
            "type": 1,
            "string": "debug"
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "read_request",
        "versionId": "1"
      },
      "param": [
        {
          "key": "headerWhitelist",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "headerName"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "X-Shopify-Topic"
                  }
                ]
              }
            ]
          }
        },
        {
          "key": "bodyAllowed",
          "value": {
            "type": 8,
            "boolean": true
          }
        },
        {
          "key": "headersAllowed",
          "value": {
            "type": 8,
            "boolean": true
          }
        },
        {
          "key": "pathAllowed",
          "value": {
            "type": 8,
            "boolean": true
          }
        },
        {
          "key": "requestAccess",
          "value": {
            "type": 1,
            "string": "specific"
          }
        },
        {
          "key": "headerAccess",
          "value": {
            "type": 1,
            "string": "specific"
          }
        },
        {
          "key": "queryParameterAccess",
          "value": {
            "type": 1,
            "string": "any"
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "return_response",
        "versionId": "1"
      },
      "param": []
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "access_response",
        "versionId": "1"
      },
      "param": [
        {
          "key": "writeResponseAccess",
          "value": {
            "type": 1,
            "string": "specific"
          }
        },
        {
          "key": "writeStatusAllowed",
          "value": {
            "type": 8,
            "boolean": true
          }
        },
        {
          "key": "writeHeaderAccess",
          "value": {
            "type": 1,
            "string": "specific"
          }
        },
        {
          "key": "writeHeadersAllowed",
          "value": {
            "type": 8,
            "boolean": true
          }
        },
        {
          "key": "writeHeaderWhitelist",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "headerName"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "Content-Type"
                  }
                ]
              },
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "headerName"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "Content-Length"
                  }
                ]
              }
            ]
          }
        },
        {
          "key": "writeBodyAllowed",
          "value": {
            "type": 8,
            "boolean": true
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "run_container",
        "versionId": "1"
      },
      "param": []
    },
    "isRequired": true
  }
]


___TESTS___

scenarios:
- name: orders/create with test JSON
  code: |
    const JSON = require("JSON");

    mock("getRequestPath", () => {
      return "/swh";
    });

    mock("getRequestHeader", (header) => {
      if (header === "X-Shopify-Topic") {
        return "orders/create";
      }
    });

    mock("getRequestBody", () => {
      const body = {
        id: 820982911946154500,
        admin_graphql_api_id: "gid://shopify/Order/820982911946154508",
        app_id: null,
        browser_ip: null,
        buyer_accepts_marketing: true,
        cancel_reason: "customer",
        cancelled_at: "2025-04-03T08:42:11+02:00",
        cart_token: null,
        checkout_id: null,
        checkout_token: null,
        client_details: null,
        closed_at: null,
        company: null,
        confirmation_number: null,
        confirmed: false,
        contact_email: "jon@example.com",
        created_at: "2025-04-03T08:42:11+02:00",
        currency: "EUR",
        current_shipping_price_set: {
          shop_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
        },
        current_subtotal_price: "169.00",
        current_subtotal_price_set: {
          shop_money: {
            amount: "169.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "169.00",
            currency_code: "EUR",
          },
        },
        current_total_additional_fees_set: null,
        current_total_discounts: "0.00",
        current_total_discounts_set: {
          shop_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
        },
        current_total_duties_set: null,
        current_total_price: "169.00",
        current_total_price_set: {
          shop_money: {
            amount: "169.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "169.00",
            currency_code: "EUR",
          },
        },
        current_total_tax: "0.00",
        current_total_tax_set: {
          shop_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
        },
        customer_locale: "nl",
        device_id: null,
        discount_codes: [],
        duties_included: false,
        email: "jon@example.com",
        estimated_taxes: false,
        financial_status: "voided",
        fulfillment_status: null,
        landing_site: null,
        landing_site_ref: null,
        location_id: null,
        merchant_business_entity_id: "MTczMTkzODgxOTAz",
        merchant_of_record_app_id: null,
        name: "#9999",
        note: null,
        note_attributes: [],
        number: 234,
        order_number: 1234,
        order_status_url:
          "https://shadesbyerickuster.com/73193881903/orders/123456abcd/authenticate?key=abcd  efg",
        original_total_additional_fees_set: null,
        original_total_duties_set: null,
        payment_gateway_names: ["visa", "bogus"],
        phone: null,
        po_number: null,
        presentment_currency: "EUR",
        processed_at: "2025-04-03T08:42:11+02:00",
        reference: null,
        referring_site: null,
        source_identifier: null,
        source_name: "web",
        source_url: null,
        subtotal_price: "159.00",
        subtotal_price_set: {
          shop_money: {
            amount: "159.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "159.00",
            currency_code: "EUR",
          },
        },
        tags: "tag1, tag2",
        tax_exempt: false,
        tax_lines: [],
        taxes_included: false,
        test: true,
        token: "123456abcd",
        total_cash_rounding_payment_adjustment_set: {
          shop_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
        },
        total_cash_rounding_refund_adjustment_set: {
          shop_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
        },
        total_discounts: "20.00",
        total_discounts_set: {
          shop_money: {
            amount: "20.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "20.00",
            currency_code: "EUR",
          },
        },
        total_line_items_price: "169.00",
        total_line_items_price_set: {
          shop_money: {
            amount: "169.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "169.00",
            currency_code: "EUR",
          },
        },
        total_outstanding: "169.00",
        total_price: "159.00",
        total_price_set: {
          shop_money: {
            amount: "159.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "159.00",
            currency_code: "EUR",
          },
        },
        total_shipping_price_set: {
          shop_money: {
            amount: "10.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "10.00",
            currency_code: "EUR",
          },
        },
        total_tax: "0.00",
        total_tax_set: {
          shop_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
          presentment_money: {
            amount: "0.00",
            currency_code: "EUR",
          },
        },
        total_tip_received: "0.00",
        total_weight: 0,
        updated_at: "2025-04-03T08:42:11+02:00",
        user_id: null,
        billing_address: {
          first_name: "Jan",
          address1: "Vruchtengaard 51",
          phone: "555-555-SHIP",
          city: "Doorn",
          zip: "3941 LG",
          province: "Utrecht",
          country: "Nederland",
          last_name: "Smit",
          address2: null,
          company: "Shipping Bedrijf",
          latitude: null,
          longitude: null,
          name: "Jan Smit",
          country_code: null,
          province_code: null,
        },
        customer: {
          id: 115310627314723950,
          email: "john@example.com",
          created_at: null,
          updated_at: null,
          first_name: "Jan",
          last_name: "Smit",
          state: "disabled",
          note: null,
          verified_email: true,
          multipass_identifier: null,
          tax_exempt: false,
          phone: null,
          currency: "EUR",
          tax_exemptions: [],
          admin_graphql_api_id: "gid://shopify/Customer/115310627314723954",
          default_address: {
            id: 715243470612851200,
            customer_id: 115310627314723950,
            first_name: null,
            last_name: null,
            company: null,
            address1: "123 Elm St.",
            address2: null,
            city: "Ottawa",
            province: "Ontario",
            country: "Canada",
            zip: "K2H7A8",
            phone: "123-123-1234",
            name: "",
            province_code: "ON",
            country_code: "CA",
            country_name: "Canada",
            default: true,
          },
        },
        discount_applications: [],
        fulfillments: [],
        line_items: [
          {
            id: 866550311766439000,
            admin_graphql_api_id: "gid://shopify/LineItem/866550311766439020",
            attributed_staffs: [
              {
                id: "gid://shopify/StaffMember/902541635",
                quantity: 1,
              },
            ],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: "manual",
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: "Dune muurverf",
            price: "29.00",
            price_set: {
              shop_money: {
                amount: "29.00",
                currency_code: "EUR",
              },
              presentment_money: {
                amount: "29.00",
                currency_code: "EUR",
              },
            },
            product_exists: true,
            product_id: 8142655586607,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sales_line_item_group_id: null,
            sku: "8721042355331",
            taxable: true,
            title: "Dune muurverf",
            total_discount: "0.00",
            total_discount_set: {
              shop_money: {
                amount: "0.00",
                currency_code: "EUR",
              },
              presentment_money: {
                amount: "0.00",
                currency_code: "EUR",
              },
            },
            variant_id: 48539281359172,
            variant_inventory_management: "shopify",
            variant_title: null,
            vendor: null,
            tax_lines: [],
            duties: [],
            discount_allocations: [],
          },
          {
            id: 141249953214522980,
            admin_graphql_api_id: "gid://shopify/LineItem/141249953214522974",
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: "manual",
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: "Dune lak",
            price: "65.00",
            price_set: {
              shop_money: {
                amount: "65.00",
                currency_code: "EUR",
              },
              presentment_money: {
                amount: "65.00",
                currency_code: "EUR",
              },
            },
            product_exists: true,
            product_id: 8144196239663,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sales_line_item_group_id: 142831562,
            sku: "8720254492414",
            taxable: true,
            title: "Dune lak",
            total_discount: "0.00",
            total_discount_set: {
              shop_money: {
                amount: "0.00",
                currency_code: "EUR",
              },
              presentment_money: {
                amount: "0.00",
                currency_code: "EUR",
              },
            },
            variant_id: 44590003618095,
            variant_inventory_management: "shopify",
            variant_title: null,
            vendor: null,
            tax_lines: [],
            duties: [],
            discount_allocations: [],
          },
          {
            id: 257004973105704600,
            admin_graphql_api_id: "gid://shopify/LineItem/257004973105704598",
            attributed_staffs: [],
            current_quantity: 1,
            fulfillable_quantity: 1,
            fulfillment_service: "manual",
            fulfillment_status: null,
            gift_card: false,
            grams: 0,
            name: "Dune muur primer",
            price: "75.00",
            price_set: {
              shop_money: {
                amount: "75.00",
                currency_code: "EUR",
              },
              presentment_money: {
                amount: "75.00",
                currency_code: "EUR",
              },
            },
            product_exists: true,
            product_id: 8144196698415,
            properties: [],
            quantity: 1,
            requires_shipping: true,
            sales_line_item_group_id: 142831562,
            sku: "8720256791546",
            taxable: true,
            title: "Dune muur primer",
            total_discount: "0.00",
            total_discount_set: {
              shop_money: {
                amount: "0.00",
                currency_code: "EUR",
              },
              presentment_money: {
                amount: "0.00",
                currency_code: "EUR",
              },
            },
            variant_id: 44590009712943,
            variant_inventory_management: "shopify",
            variant_title: null,
            vendor: null,
            tax_lines: [],
            duties: [],
            discount_allocations: [],
          },
        ],
        payment_terms: null,
        refunds: [],
        shipping_address: {
          first_name: "Jan",
          address1: "Vruchtengaard 51",
          phone: "555-555-SHIP",
          city: "Doorn",
          zip: "3941 LG",
          province: "Utrecht",
          country: "Nederland",
          last_name: "Smit",
          address2: null,
          company: "Shipping Bedrijf",
          latitude: null,
          longitude: null,
          name: "Jan Smit",
          country_code: null,
          province_code: null,
        },
        shipping_lines: [
          {
            id: 271878346596884000,
            carrier_identifier: null,
            code: null,
            current_discounted_price_set: {
              shop_money: {
                amount: "0.00",
                currency_code: "EUR",
              },
              presentment_money: {
                amount: "0.00",
                currency_code: "EUR",
              },
            },
            discounted_price: "10.00",
            discounted_price_set: {
              shop_money: {
                amount: "10.00",
                currency_code: "EUR",
              },
              presentment_money: {
                amount: "10.00",
                currency_code: "EUR",
              },
            },
            is_removed: false,
            phone: null,
            price: "10.00",
            price_set: {
              shop_money: {
                amount: "10.00",
                currency_code: "EUR",
              },
              presentment_money: {
                amount: "10.00",
                currency_code: "EUR",
              },
            },
            requested_fulfillment_service_id: null,
            source: "shopify",
            title: "Generic Shipping",
            tax_lines: [],
            discount_allocations: [],
          },
        ],
        returns: [],
      };
      return JSON.stringify(body);
    });

    runCode();
setup: ''


___NOTES___

Created on 4/8/2025, 8:25:07 AM



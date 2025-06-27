$(document).ready(function () {
  function getCookie(name) {
    let cookie = {};
    document.cookie.split(";").forEach(function (el) {
      let split = el.split("=");
      cookie[split[0].trim()] = split.slice(1).join("=");
    });
    return cookie[name];
  }

  function getGaClientId() {
    const cookie = getCookie("_ga");
    if (!cookie) return undefined;
    return cookie.split(".").slice(2).join(".");
  }

  function getGaSessionId() {
    const cookie = getCookie("_ga_5311K1XXHW"); // TODO Do not hardcode this
    if (!cookie) return undefined;
    return parseInt(cookie.split(".")[2]);
  }

  function getGaSessionCount() {
    const cookie = getCookie("_ga_5311K1XXHW"); // TODO Do not hardcode this
    if (!cookie) return undefined;
    return parseInt(cookie.split(".")[3]);
  }

  function getShopifyClientId() {
    // return ShopifyAnalytics.lib.user().traits().uniqToken;
    const cookie = getCookie("_shopify_y");
    if (!cookie) return undefined;
    return cookie;
  }

  function getShopifySessionId() {
    const cookie = getCookie("_shopify_s");
    if (!cookie) return undefined;
    return cookie;
  }

  const params = new URLSearchParams(document.location.search);
  const fbclid = params.get("fbclid");
  const gclid = params.get("gclid");
  const gaClientId = getGaClientId();
  const gaSessionId = getGaSessionId();
  const gaSessionCount = getGaSessionCount();
  const shopifyClientId = getShopifyClientId();
  const shopifySessionId = getShopifySessionId();

  if (
    fbclid ||
    gclid ||
    gaClientId ||
    gaSessionId ||
    gaSessionCount ||
    shopifyClientId ||
    shopifySessionId
  ) {
    let formData = new FormData();

    if (fbclid) formData.append("attributes[_fbclid]", fbclid);
    if (gclid) formData.append("attributes[_gclid]", gclid);
    if (gaClientId) formData.append("attributes[_cid]", gaClientId);
    if (gaSessionId) formData.append("attributes[_sid]", gaSessionId);
    if (gaSessionCount) formData.append("attributes[_sct]", gaSessionCount);
    if (shopifyClientId)
      formData.append("attributes[_shopify_y]", shopifyClientId);
    if (shopifySessionId)
      formData.append("attributes[_shopify_s]", shopifySessionId);

    fetch(window.Shopify.routes.root + "cart/update.js", {
      method: "POST",
      body: formData,
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log("added attributes to cart:", data);
      });
  }
});

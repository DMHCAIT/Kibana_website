import type { Product } from "@/types/product";

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
    fbq?: (event: string, name: string, data?: Record<string, unknown>) => void;
  }
}

type Ga4Item = {
  item_id: string;
  item_name: string;
  item_category: string;
  item_brand: string;
  price: number;
  quantity: number;
};

// ────────────────────────────────────────────────────────────────────────────
// GTM/GA4 HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

function canTrack() {
  return typeof window !== "undefined" && Array.isArray(window.dataLayer);
}

function pushGtmEvent(payload: Record<string, unknown>) {
  if (!canTrack()) return;
  window.dataLayer.push(payload);
}

function toGa4Item(product: Product, quantity = 1): Ga4Item {
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    item_brand: "Kibana",
    price: product.price,
    quantity,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// META PIXEL HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

function trackMetaEvent(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, data || {});
}

// ────────────────────────────────────────────────────────────────────────────
// EVENT TRACKING - ALL 11 EVENTS
// ────────────────────────────────────────────────────────────────────────────

/** 1. LOGIN EVENT - Fired when user logs in */
export function trackLogin(userId: string) {
  pushGtmEvent({
    event: "login",
    method: "email_otp",
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("Login", { user_id: userId });
}

/** 2. SIGN UP EVENT - Fired when user completes registration */
export function trackSignUp(userId: string, email?: string) {
  pushGtmEvent({
    event: "sign_up",
    method: "email_otp",
    user_id: userId,
    email: email,
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("CompleteRegistration", { user_id: userId, email: email });
}

/** 3. PAGE VIEW EVENT - Fired on every page load */
export function trackPageView(pagePath: string, pageTitle: string) {
  pushGtmEvent({
    event: "page_view",
    page_path: pagePath,
    page_title: pageTitle,
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("PageView", { page_path: pagePath, page_title: pageTitle });
}

/** 4. SELECT CATEGORY EVENT - Fired when user filters product category */
export function trackSelectCategory(category: string) {
  pushGtmEvent({
    event: "view_item_list",
    event_category: "engagement",
    event_label: category,
    items: [{ item_category: category }],
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("ViewContent", {
    content_name: `Category: ${category}`,
    content_type: "category",
    content_category: category,
  });
}

/** 5. VIEW CONTENT EVENT - Fired when user views product details */
export function trackViewContent(product: Product) {
  pushGtmEvent({
    event: "view_item",
    ecommerce: {
      currency: "INR",
      value: product.price,
      items: [toGa4Item(product)],
    },
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("ViewContent", {
    content_name: product.name,
    content_type: "product",
    content_ids: [product.id],
    content_category: product.category,
    value: product.price,
    currency: "INR",
  });
}

/** 6. PRODUCT LISTING VIEW EVENT - Fired when user views shop page */
export function trackProductListingView(category?: string, productCount?: number) {
  pushGtmEvent({
    event: "view_item_list",
    event_category: "engagement",
    event_label: category || "all_products",
    items: category ? [{ item_category: category }] : [],
    product_count: productCount,
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("ViewContent", {
    content_name: `Product Listing${category ? ": " + category : ""}`,
    content_type: "product_list",
    content_category: category,
  });
}

/** 7. MY ACCOUNT EVENT - Fired when user visits account page */
export function trackMyAccount(userId: string) {
  pushGtmEvent({
    event: "view_account",
    user_id: userId,
    event_category: "account",
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("ViewContent", {
    content_name: "My Account",
    content_type: "account",
    user_id: userId,
  });
}

/** 8. WISHLIST EVENT - Fired when user adds/removes from wishlist */
export function trackWishlist(
  product: Product,
  action: "add" | "remove" = "add",
  userId?: string
) {
  const eventName = action === "add" ? "add_to_wishlist" : "remove_from_wishlist";
  pushGtmEvent({
    event: eventName,
    ecommerce: {
      currency: "INR",
      value: product.price,
      items: [toGa4Item(product)],
    },
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("AddToWishlist", {
    content_name: product.name,
    content_type: "product",
    content_ids: [product.id],
    value: product.price,
    currency: "INR",
  });
}

/** 9. ADD TO CART EVENT - Fired when user adds product to cart */
export function trackAddToCart(
  product: Product,
  quantity: number,
  userId?: string
) {
  pushGtmEvent({
    event: "add_to_cart",
    ecommerce: {
      currency: "INR",
      value: product.price * quantity,
      items: [toGa4Item(product, quantity)],
    },
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("AddToCart", {
    content_name: product.name,
    content_type: "product",
    content_ids: [product.id],
    quantity: quantity,
    value: product.price * quantity,
    currency: "INR",
  });
}

/** 10. CHECKOUT EVENT - Fired when user initiates checkout */
export function trackCheckout(
  items: Array<{ product: Product; quantity: number }>,
  total: number,
  userId?: string
) {
  const ga4Items = items.map((item) => toGa4Item(item.product, item.quantity));
  pushGtmEvent({
    event: "begin_checkout",
    ecommerce: {
      currency: "INR",
      value: total,
      items: ga4Items,
    },
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("InitiateCheckout", {
    content_type: "checkout",
    content_ids: items.map((i) => i.product.id),
    num_items: items.length,
    value: total,
    currency: "INR",
  });
}

/** 11. PURCHASE EVENT - Fired when user completes purchase (MOST IMPORTANT) */
export function trackPurchase(
  orderId: string,
  items: Array<{ product: Product; quantity: number }>,
  total: number,
  userId?: string,
  paymentMethod?: string
) {
  const ga4Items = items.map((item) => toGa4Item(item.product, item.quantity));
  pushGtmEvent({
    event: "purchase",
    transaction_id: orderId,
    ecommerce: {
      currency: "INR",
      value: total,
      transaction_id: orderId,
      items: ga4Items,
    },
    user_id: userId,
    payment_method: paymentMethod || "unknown",
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("Purchase", {
    content_type: "purchase",
    content_ids: items.map((i) => i.product.id),
    content_name: `Order #${orderId}`,
    num_items: items.length,
    value: total,
    currency: "INR",
  });
}

// SERVER-SIDE CONVERSIONS API
export async function trackConversionAPI(
  eventName: string,
  data: { user_id?: string; email?: string; phone?: string; [key: string]: unknown }
) {
  try {
    await fetch("/api/analytics/conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, data, timestamp: Math.floor(Date.now() / 1000) }),
    });
  } catch (error) {
    console.error("Failed to track conversion:", error);
  }
}

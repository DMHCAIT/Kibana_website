import type { Product } from "@/types/product";

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
    fbq?: (event: string, name: string, data?: Record<string, unknown>) => void;
    gtag?: (...args: unknown[]) => void;
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

// Direct GA4 tracking via gtag() — ensures events reach GA4 even if GTM is misconfigured
function trackGa4Event(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, data || {});
}

// ────────────────────────────────────────────────────────────────────────────
// META PIXEL HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

// Valid Meta Pixel standard events
const META_STANDARD_EVENTS = [
  "Purchase",
  "AddToCart",
  "ViewContent",
  "CompleteRegistration",
  "Login",
  "PageView",
  "InitiateCheckout",
  "AddToWishlist",
  "Contact",
  "Search",
] as const;

function validateEventName(eventName: string): boolean {
  return META_STANDARD_EVENTS.includes(eventName as any);
}

function trackMetaEvent(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  
  // Validate event name
  if (!validateEventName(eventName)) {
    console.warn(`⚠️ Meta event "${eventName}" may not be recognized. Use standard Meta event names.`);
  }
  
  // Ensure required fields for Purchase events
  if (eventName === "Purchase" && data) {
    if (!data.value) console.warn("⚠️ Purchase event missing 'value' field");
    if (!data.currency) console.warn("⚠️ Purchase event missing 'currency' field");
    if (!data.content_type) console.warn("⚠️ Purchase event missing 'content_type' field");
  }
  
  window.fbq("track", eventName, data || {});
}

// ────────────────────────────────────────────────────────────────────────────
// EVENT TRACKING - ALL 11 EVENTS
// ────────────────────────────────────────────────────────────────────────────

/** 1. LOGIN EVENT - Fired when user logs in */
export function trackLogin(userId: string, email?: string) {
  pushGtmEvent({
    event: "login",
    method: "email_otp",
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
  
  // Direct GA4 tracking
  trackGa4Event("login", { method: "email_otp", user_id: userId });
  
  trackMetaEvent("Login", { user_id: userId });
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("Login", {
    user_id: userId,
    email: email,
  });
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
  
  // Direct GA4 tracking
  trackGa4Event("sign_up", { method: "email_otp", user_id: userId });
  
  trackMetaEvent("CompleteRegistration", { user_id: userId, email: email });
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("CompleteRegistration", {
    user_id: userId,
    email: email,
  });
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
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("ViewContent", {
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
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("ViewContent", {
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
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("ViewContent", {
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
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("ViewContent", {
    user_id: userId,
    content_name: "My Account",
    content_type: "account",
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
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("AddToWishlist", {
    user_id: userId,
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
  userId?: string,
  userEmail?: string
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
  
  // Direct GA4 tracking
  trackGa4Event("add_to_cart", {
    items: [toGa4Item(product, quantity)],
    currency: "INR",
    value: product.price * quantity,
  });
  
  trackMetaEvent("AddToCart", {
    content_name: product.name,
    content_type: "product",
    content_ids: [product.id],
    content_category: product.category,
    quantity: quantity,
    value: product.price * quantity,
    currency: "INR",
  });
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("AddToCart", {
    user_id: userId,
    email: userEmail,
    value: product.price * quantity,
    currency: "INR",
    content_type: "product",
    content_ids: [product.id].join(","),
    content_name: product.name,
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
  
  // Direct GA4 tracking
  trackGa4Event("begin_checkout", {
    items: ga4Items,
    currency: "INR",
    value: total,
  });
  
  trackMetaEvent("InitiateCheckout", {
    content_type: "checkout",
    content_ids: items.map((i) => i.product.id),
    num_items: items.length,
    value: total,
    currency: "INR",
  });
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("InitiateCheckout", {
    user_id: userId,
    content_type: "checkout",
    content_ids: items.map((i) => i.product.id).join(","),
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
  paymentMethod?: string,
  userEmail?: string
) {
  const ga4Items = items.map((item) => toGa4Item(item.product, item.quantity));
  
  // GA4/GTM Event
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
  
  // Direct GA4 tracking (in addition to GTM)
  trackGa4Event("purchase", {
    transaction_id: orderId,
    value: total,
    currency: "INR",
    items: ga4Items,
    payment_method: paymentMethod || "unknown",
  });
  
  // Meta Pixel Purchase Event with ALL required fields per Meta spec
  const metaPurchaseData = {
    content_type: "product",
    content_ids: items.map((i) => i.product.id),
    content_name: `Order ${orderId}`,
    num_items: items.length,
    value: total,
    currency: "INR",
    payment_method: paymentMethod || "unknown",
  };
  
  trackMetaEvent("Purchase", metaPurchaseData);
  
  // SERVER-SIDE CONVERSIONS API for guaranteed delivery
  // This ensures Meta receives the conversion even if client-side tracking is blocked
  trackConversionAPI("Purchase", {
    user_id: userId,
    email: userEmail,
    value: total,
    currency: "INR",
    order_id: orderId,
    num_items: items.length,
    content_type: "product",
    content_ids: items.map((i) => i.product.id).join(","),
    content_name: `Order ${orderId}`,
    payment_method: paymentMethod || "unknown",
  });
}

// SERVER-SIDE CONVERSIONS API
export async function trackConversionAPI(
  eventName: string,
  data: { user_id?: string; email?: string; phone?: string; [key: string]: unknown }
) {
  try {
    // If no email/phone provided, try to fetch current user to include customer data
    // Meta Conversions API requires at least one customer information parameter
    if (!data.email && !data.phone && typeof window !== "undefined") {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const user = await res.json();
          if (user.email && !data.email) {
            data.email = user.email;
          }
          if (user.phone && !data.phone) {
            data.phone = user.phone;
          }
        }
      } catch {
        // Failed to fetch user, continue without user data
      }
    }

    await fetch("/api/analytics/conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, data, timestamp: Math.floor(Date.now() / 1000) }),
    });
  } catch (error) {
    console.error("Failed to track conversion:", error);
  }
}

/** 12. CONTACT EVENT - Fired when user submits contact form */
export function trackContact(email?: string, phone?: string) {
  pushGtmEvent({
    event: "contact",
    email: email,
    phone: phone,
    timestamp: new Date().toISOString(),
  });
  
  trackMetaEvent("Contact", {
    content_name: "Contact Form Submission",
    content_type: "lead",
    email: email,
    phone: phone,
  });
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("Contact", {
    email: email,
    phone: phone,
  });
}

/** 13. SEARCH EVENT - Fired when user searches products */
export function trackSearch(query: string, resultsCount?: number) {
  pushGtmEvent({
    event: "search",
    search_term: query,
    results_count: resultsCount,
    timestamp: new Date().toISOString(),
  });
  
  trackMetaEvent("Search", {
    search_string: query,
    content_name: `Product Search: ${query}`,
    content_type: "search",
  });
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("Search", {
    search_term: query,
    results_count: resultsCount,
  });
}

/** UTILITY EVENTS - Track page views for content pages */
export function trackViewPage(pageName: string, pageType: string) {
  pushGtmEvent({
    event: "view_page",
    page_name: pageName,
    page_type: pageType,
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("ViewContent", {
    content_name: pageName,
    content_type: pageType,
  });
  
  // Server-side tracking for guaranteed delivery
  trackConversionAPI("ViewContent", {
    content_name: pageName,
    content_type: pageType,
  });
}

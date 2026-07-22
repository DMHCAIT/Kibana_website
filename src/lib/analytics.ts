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
  item_variant?: string;
  variant_id?: string; // Unique variant identifier (productId-colorSlug)
  product_name?: string; // Complete product name with color (as stored in DB)
  product_image?: string; // Variant-specific image URL
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

function toGa4Item(
  product: Product,
  quantity = 1,
  variantPrice?: number,
  variantColor?: string,
  variantId?: string,
  productName?: string,
  productImage?: string,
): Ga4Item {
  const item: Ga4Item = {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    item_brand: "Kibana",
    price: variantPrice ?? product.price,
    quantity,
  };

  // Add color variant if provided
  if (variantColor) {
    item.item_variant = variantColor;
  }

  // Add variant ID (unique identifier like "productId-colorSlug")
  if (variantId) {
    item.variant_id = variantId;
  }

  // Add complete product name with color (as stored in database)
  if (productName) {
    item.product_name = productName;
  }

  // Add variant-specific image URL
  if (productImage) {
    item.product_image = productImage;
  }

  return item;
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
  return META_STANDARD_EVENTS.includes(eventName as (typeof META_STANDARD_EVENTS)[number]);
}

/**
 * Get Facebook Click ID (fbc) from fbclid URL parameter
 * This is automatically added by Meta when user clicks on a Meta ad
 */
function getFbcFromUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get("fbclid");
    return fbclid || "";
  } catch {
    return "";
  }
}

/**
 * Get Facebook Pixel ID (fbp) from _fbp cookie
 * This is automatically set by Meta Pixel base code
 */
function getFbpFromCookie(): string {
  if (typeof window === "undefined") return "";
  try {
    // Get _fbp cookie value
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      if (cookie.startsWith("_fbp=")) {
        return cookie.substring(5); // Remove "_fbp=" prefix
      }
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * Get or initialize Facebook Click ID
 * Stores fbclid from URL in sessionStorage for persistence across page loads
 */
function getFbc(): string {
  if (typeof window === "undefined") return "";
  try {
    // Try to get from sessionStorage first (persisted from initial page load)
    let fbc = sessionStorage.getItem("_fbc");
    if (fbc) return fbc;

    // If not in sessionStorage, get from URL
    fbc = getFbcFromUrl();
    if (fbc) {
      // Store in sessionStorage for future events
      sessionStorage.setItem("_fbc", fbc);
    }
    return fbc;
  } catch {
    return "";
  }
}

/**
 * Get Facebook Browser ID from cookie
 */
function getFbp(): string {
  if (typeof window === "undefined") return "";
  try {
    return getFbpFromCookie();
  } catch {
    return "";
  }
}

function trackMetaEvent(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;

  // Validate event name
  if (!validateEventName(eventName)) {
    console.warn(
      `⚠️ Meta event "${eventName}" may not be recognized. Use standard Meta event names.`,
    );
  }

  // Ensure required fields for Purchase events
  if (eventName === "Purchase" && data) {
    if (!data.value) console.warn("⚠️ Purchase event missing 'value' field");
    if (!data.currency) console.warn("⚠️ Purchase event missing 'currency' field");
    if (!data.content_type) console.warn("⚠️ Purchase event missing 'content_type' field");
  }

  // Add fbc and fbp for event matching
  const enhancedData = {
    ...data,
    ...(getFbc() && { fbc: getFbc() }),
    ...(getFbp() && { fbp: getFbp() }),
  };

  window.fbq("track", eventName, enhancedData);
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

  // Meta Pixel Login Event - Include email for better user matching
  trackMetaEvent("Login", {
    user_id: userId,
    email: email,
  });

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
export function trackViewContent(product: Product, variantPrice?: number, variantColor?: string) {
  const price = variantPrice ?? product.price;
  const displayName = variantColor ? `${product.name} - ${variantColor}` : product.name;

  pushGtmEvent({
    event: "view_item",
    ecommerce: {
      currency: "INR",
      value: price,
      items: [toGa4Item(product, 1, price, variantColor)],
    },
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("ViewContent", {
    content_name: displayName,
    content_type: "product",
    content_ids: [product.id],
    content_category: product.category,
    value: price,
    currency: "INR",
  });

  // Server-side tracking for guaranteed delivery
  trackConversionAPI("ViewContent", {
    content_name: displayName,
    content_type: "product",
    content_ids: [product.id],
    content_category: product.category,
    value: price,
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
  userId?: string,
  variantPrice?: number,
) {
  const price = variantPrice ?? product.price;
  const eventName = action === "add" ? "add_to_wishlist" : "remove_from_wishlist";
  pushGtmEvent({
    event: eventName,
    ecommerce: {
      currency: "INR",
      value: price,
      items: [toGa4Item(product, 1, price)],
    },
    user_id: userId,
    timestamp: new Date().toISOString(),
  });
  trackMetaEvent("AddToWishlist", {
    content_name: product.name,
    content_type: "product",
    content_ids: [product.id],
    value: price,
    currency: "INR",
  });

  // Server-side tracking for guaranteed delivery
  trackConversionAPI("AddToWishlist", {
    user_id: userId,
    content_name: product.name,
    content_type: "product",
    content_ids: [product.id],
    value: price,
    currency: "INR",
  });
}

/** 9. ADD TO CART EVENT - Fired when user adds product to cart */
export function trackAddToCart(
  product: Product,
  quantity: number,
  userId?: string,
  userEmail?: string,
  variantPrice?: number,
  variantColor?: string,
  variantId?: string,
  productName?: string,
  productImage?: string,
) {
  const price = variantPrice ?? product.price;
  const totalValue = price * quantity;

  // Use complete product name if provided (as stored in DB), otherwise construct it
  const displayName =
    productName || (variantColor ? `${product.name} - ${variantColor}` : product.name);

  pushGtmEvent({
    event: "add_to_cart",
    ecommerce: {
      currency: "INR",
      value: totalValue,
      items: [
        toGa4Item(product, quantity, price, variantColor, variantId, productName, productImage),
      ],
    },
    user_id: userId,
    timestamp: new Date().toISOString(),
  });

  // Direct GA4 tracking
  trackGa4Event("add_to_cart", {
    items: [
      toGa4Item(product, quantity, price, variantColor, variantId, productName, productImage),
    ],
    currency: "INR",
    value: totalValue,
  });

  trackMetaEvent("AddToCart", {
    content_name: displayName,
    content_type: "product",
    content_ids: [product.id],
    content_category: product.category,
    quantity: quantity,
    value: totalValue,
    currency: "INR",
    variant_id: variantId,
    product_image: productImage,
  });

  // Server-side tracking for guaranteed delivery
  trackConversionAPI("AddToCart", {
    user_id: userId,
    email: userEmail,
    value: totalValue,
    currency: "INR",
    content_type: "product",
    content_ids: [product.id].join(","),
    content_name: displayName,
    variant_id: variantId,
    product_image: productImage,
  });
}

/** 10. CHECKOUT EVENT - Fired when user initiates checkout */
export function trackCheckout(
  items: Array<{ product: Product; quantity: number; selectedColorSlug?: string }>,
  total: number,
  userId?: string,
) {
  // Calculate GA4 items using variant prices and colors if available
  const ga4Items = items.map((item) => {
    const variant = item.selectedColorSlug
      ? item.product.colorVariants?.find((v) => v.slug === item.selectedColorSlug)
      : undefined;
    const variantPrice = variant?.price ?? item.product.price;
    const variantColor = variant?.color;
    return toGa4Item(item.product, item.quantity, variantPrice, variantColor);
  });
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
  items: Array<{ product: Product; quantity: number; selectedColorSlug?: string }>,
  total: number,
  userId?: string,
  paymentMethod?: string,
  userEmail?: string,
  itemDetails?: Array<{ variantId?: string; productName?: string; productImage?: string }>,
) {
  // Calculate GA4 items using variant prices, colors, and complete product information if available
  const ga4Items = items.map((item, index) => {
    const variant = item.selectedColorSlug
      ? item.product.colorVariants?.find((v) => v.slug === item.selectedColorSlug)
      : undefined;
    const variantPrice = variant?.price ?? item.product.price;
    const variantColor = variant?.color;

    // Use provided item details if available (most accurate - exact state when added)
    const detail = itemDetails?.[index];
    const variantId = detail?.variantId;
    const productName = detail?.productName;
    const productImage = detail?.productImage;

    return toGa4Item(
      item.product,
      item.quantity,
      variantPrice,
      variantColor,
      variantId,
      productName,
      productImage,
    );
  });

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

  // Build content details with variant information and stored product names
  const contentDetails = items
    .map((item, index) => {
      const detail = itemDetails?.[index];
      // Use stored product name if available (most accurate), otherwise calculate
      if (detail?.productName) {
        return detail.productName;
      }

      const variant = item.selectedColorSlug
        ? item.product.colorVariants?.find((v) => v.slug === item.selectedColorSlug)
        : undefined;
      const variantColor = variant?.color || "Default";
      return `${item.product.name} - ${variantColor}`;
    })
    .join(", ");

  // Meta Pixel Purchase Event with variant details
  const metaPurchaseData = {
    content_type: "product",
    content_ids: items.map((i) => i.product.id),
    content_name: contentDetails || `Order ${orderId}`,
    num_items: items.length,
    value: total,
    currency: "INR",
    payment_method: paymentMethod || "unknown",
  };

  trackMetaEvent("Purchase", metaPurchaseData);

  // SERVER-SIDE CONVERSIONS API for guaranteed delivery
  // Include variant details in content_name for tracking
  trackConversionAPI("Purchase", {
    user_id: userId,
    email: userEmail,
    value: total,
    currency: "INR",
    order_id: orderId,
    num_items: items.length,
    content_type: "product",
    content_ids: items.map((i) => i.product.id).join(","),
    content_name: contentDetails || `Order ${orderId}`,
    payment_method: paymentMethod || "unknown",
  });
}

// SERVER-SIDE CONVERSIONS API
export async function trackConversionAPI(
  eventName: string,
  data: {
    user_id?: string;
    email?: string;
    phone?: string;
    fbc?: string;
    fbp?: string;
    [key: string]: unknown;
  },
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

    // Add fbc and fbp for event matching (if not already provided)
    if (typeof window !== "undefined") {
      if (!data.fbc) {
        const fbc = getFbc();
        if (fbc) data.fbc = fbc;
      }
      if (!data.fbp) {
        const fbp = getFbp();
        if (fbp) data.fbp = fbp;
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

  // Meta Pixel Contact Event - Use only Meta-standard fields
  trackMetaEvent("Contact", {
    content_name: "Contact Form Submission",
    content_type: "lead",
  });

  // Server-side tracking for guaranteed delivery (includes PII)
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

/** PAGE VIEW API - Track automatic page views to server */
export async function trackPageViewAPI(pathname: string, pageName?: string) {
  // NOTE: PageView is NOT sent to Meta Conversions API
  // Meta API only accepts conversion events (Purchase, AddToCart, etc.)
  // PageView is tracked client-side via GA4 gtag() and Meta fbq() instead

  // This function is kept for future use or custom analytics
  // Currently disabled to avoid Meta API errors
  try {
    // Removed server-side PageView tracking - use client-side GA4/Meta only
    console.debug(`📊 Page viewed: ${pageName || pathname}`);
  } catch (error) {
    console.debug("Page view tracking (client-side):", error);
  }
}

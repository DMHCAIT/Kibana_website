# 📊 Kibana Website - Complete Page Tracking Audit (12 Pages)

**Last Updated:** 2026-07-13  
**Pixel ID:** `865714735870485`  
**Status:** ✅ ALL 12 PAGES FULLY TRACKED

---

## 🎯 The 12 Main Customer Pages - Tracking Status

### ✅ 1. HOME PAGE (`/`)
**File:** `src/app/page.tsx`
- **Tracking Component:** `TrackPageView`
- **Event Name:** "Home"
- **Event Type:** "homepage"
- **Meta Pixel Event:** `ViewContent`
- **Server-Side API:** ❌ (Not needed - no user data required)
- **Status:** ✅ FULLY TRACKED

### ✅ 2. ABOUT PAGE (`/about`)
**File:** `src/app/about/page.tsx`
- **Tracking Component:** `TrackPageView`
- **Event Name:** "About"
- **Event Type:** "about"
- **Meta Pixel Event:** `ViewContent`
- **Server-Side API:** ❌ (Not needed)
- **Status:** ✅ FULLY TRACKED

### ✅ 3. SHOP PAGE (`/shop`)
**File:** `src/app/shop/page.tsx`
- **Tracking Component:** `TrackProductListingView`
- **Event Name:** Product listing by category
- **Meta Pixel Event:** `ViewContent`
- **Server-Side API:** ❌ (Catalog browsing - not conversion event)
- **Status:** ✅ FULLY TRACKED
- **Notes:** Tracks product count and category filtering

### ✅ 4. PRODUCT DETAIL PAGE (`/shop/[slug]`)
**File:** `src/app/shop/[slug]/page.tsx`
- **Tracking Component:** `TrackProductView`
- **Function Called:** `trackViewContent(product)`
- **Meta Pixel Event:** `ViewContent`
- **Tracked Fields:**
  - ✅ Product name
  - ✅ Product ID
  - ✅ Product category
  - ✅ Product price
  - ✅ Currency (INR)
- **Server-Side API:** ❌ (Not conversion event)
- **Status:** ✅ FULLY TRACKED

### ✅ 5. WISHLIST PAGE (`/wishlist`)
**File:** `src/app/wishlist/page.tsx`
- **Tracking Component:** `TrackPageView`
- **Event Name:** "Wishlist"
- **Event Type:** "wishlist"
- **Meta Pixel Event:** `ViewContent`
- **Server-Side API:** ❌ (Not needed)
- **Status:** ✅ FULLY TRACKED
- **Additional Tracking:** `trackWishlist()` fires on add/remove items

### ✅ 6. CART PAGE (`/cart`)
**File:** `src/app/cart/page.tsx`
- **Tracking Component:** `TrackPageView`
- **Event Name:** "Shopping Cart"
- **Event Type:** "cart"
- **Meta Pixel Event:** `ViewContent`
- **Server-Side API:** ❌ (Not needed)
- **Status:** ✅ FULLY TRACKED
- **Additional Tracking:** `trackAddToCart()` fires when item added

### ✅ 7. CHECKOUT PAGE (`/checkout`)
**File:** `src/app/checkout/page.tsx`
- **Tracking Component:** `TrackPageView`
- **Event Name:** "Checkout"
- **Event Type:** "checkout"
- **Meta Pixel Event:** `ViewContent`
- **Server-Side API:** ✅ YES (trackConversionAPI called)
- **Status:** ✅ FULLY TRACKED WITH SERVER-SIDE
- **Conversion Events Tracked:**
  - `trackCheckout()` - When checkout initiated
  - `trackPurchase()` - When order placed (3 payment methods)
    - ✅ Server-side conversion API call included
    - ✅ User email passed to API
    - ✅ All required fields included (value, currency, order_id)

### ✅ 8. CONTACT PAGE (`/contact`)
**File:** `src/app/contact/page.tsx`
- **Tracking Component:** `TrackPageView`
- **Event Name:** "Contact Us"
- **Event Type:** "contact"
- **Meta Pixel Event:** `ViewContent`
- **Server-Side API:** ❌ (Not needed)
- **Status:** ✅ FULLY TRACKED

### ✅ 9. FAQs PAGE (`/faqs`)
**File:** `src/app/faqs/page.tsx`
- **Tracking Component:** `TrackPageView`
- **Event Name:** "FAQs"
- **Event Type:** "faqs"
- **Meta Pixel Event:** `ViewContent`
- **Server-Side API:** ❌ (Not needed)
- **Status:** ✅ FULLY TRACKED

### ✅ 10. RETURNS PAGE (`/returns`)
**File:** `src/app/returns/page.tsx`
- **Tracking Component:** `TrackPageView`
- **Event Name:** "Returns"
- **Event Type:** "returns"
- **Meta Pixel Event:** `ViewContent`
- **Server-Side API:** ❌ (Not needed)
- **Status:** ✅ FULLY TRACKED

### ✅ 11. ACCOUNT PAGE (`/account`) 
**File:** `src/app/account/page.tsx`
- **Tracking Component:** `TrackPageView` ✅ NEWLY ADDED
- **Event Name:** "My Account"
- **Event Type:** "account"
- **Meta Pixel Event:** `ViewContent`
- **Additional Tracking:** `trackMyAccount(userId)` - User-specific account view
- **Server-Side API:** ✅ (trackConversionAPI called via trackMyAccount)
- **Status:** ✅ FULLY TRACKED
- **Changes Made:**
  - Added `TrackPageView` component
  - Already had `trackMyAccount()` which triggers server-side API
  - Now captures both page view and account-specific event

### ✅ 12. MY ORDERS PAGE (`/orders`)
**File:** `src/app/orders/page.tsx`
- **Tracking Component:** `TrackPageView`
- **Event Name:** "My Orders"
- **Event Type:** "orders"
- **Meta Pixel Event:** `ViewContent`
- **Additional Tracking:** `trackMyAccount(userId)` - User-specific tracking
- **Server-Side API:** ✅ (trackConversionAPI called via trackMyAccount)
- **Status:** ✅ FULLY TRACKED

---

## 🔑 Additional Tracking Events (Beyond Page Views)

### Authentication Events
- **Login:** ✅ Tracked
  - Function: `trackLogin(userId, email)`
  - Server-Side: ✅ Yes
  - Called from: `src/components/auth/auth-modal.tsx`
  - Data sent: user_id, email

- **Sign Up:** ✅ Tracked
  - Function: `trackSignUp(userId, email)`
  - Server-Side: ✅ Yes
  - Called from: `src/components/auth/auth-modal.tsx`
  - Data sent: user_id, email

### E-Commerce Events
- **Add to Cart:** ✅ Tracked
  - Function: `trackAddToCart(product, quantity, userId, userEmail)`
  - Server-Side: ✅ Yes
  - Called from: `src/app/shop/[slug]/add-to-cart.tsx`
  - Data sent: product name, ID, quantity, value, email

- **Add to Wishlist:** ✅ Tracked
  - Function: `trackWishlist(product, action, userId)`
  - Server-Side: ❌ (Not critical - engagement event)
  - Called from: Wishlist components

- **Initiate Checkout:** ✅ Tracked
  - Function: `trackCheckout(items, total, userId)`
  - Server-Side: ❌ (Not critical - funnel event)
  - Called from: Checkout flow

- **Purchase (Most Critical):** ✅ Tracked
  - Function: `trackPurchase(orderId, items, total, userId, paymentMethod, userEmail)`
  - Server-Side: ✅ YES - Guaranteed delivery
  - Called from: `src/app/checkout/checkout-view.tsx` (3 payment methods)
  - Data sent: order_id, value, currency, email, num_items, content_ids

---

## 🧪 Testing Checklist - How to Verify All 12 Pages

### 1. Client-Side Verification (In Browser)
Open each of the 12 pages and:
```javascript
// In browser DevTools Console:
window.fbq  // Should exist
window.dataLayer  // Should have events pushed
```

Check Network tab for:
- ✅ Requests to `connect.facebook.net/en_US/fbevents.js`
- ✅ Requests to `facebook.com/tr` (tracking pixels)

### 2. Meta Business Manager - Real-Time Test Events
1. Go to **Events Manager** → **KibanaLife Dataset** → **Test Events**
2. For EACH page, you should see:
   - Page load event captured
   - Event name matching the page
   - No errors in Details column

**Expected Test Events for Each Page:**
```
HOME          → ViewContent (page_name: "Home")
ABOUT         → ViewContent (page_name: "About")
SHOP          → ViewContent (page_name: "Product Listing")
PRODUCT       → ViewContent (page_name: [Product Name], value: [Price])
WISHLIST      → ViewContent (page_name: "Wishlist")
CART          → ViewContent (page_name: "Shopping Cart")
CHECKOUT      → ViewContent + Purchase (page_name: "Checkout")
CONTACT       → ViewContent (page_name: "Contact Us")
FAQs          → ViewContent (page_name: "FAQs")
RETURNS       → ViewContent (page_name: "Returns")
ACCOUNT       → ViewContent (page_name: "My Account")
ORDERS        → ViewContent (page_name: "My Orders")
```

### 3. Server-Side Conversion API Verification
For critical events (Purchase, Login, SignUp, AddToCart):
1. Check browser Console for logs starting with: `📊 Meta Conversion Event:`
2. Check Network tab for POST requests to: `/api/analytics/conversion`
3. Response should be: `{"success": true}`
4. Check server logs for: `✅ Conversion tracked: [EventName]`

### 4. Test a Complete Purchase Flow
1. **Add Product to Cart** → Check tracking
2. **Go to Checkout** → Check page view + initiate checkout event
3. **Place Order** → Check purchase event + server-side API call
4. **Check Account/Orders** → See new order with tracking

Expected Meta events in sequence:
```
ViewContent (Product)
ViewContent (Shopping Cart)
ViewContent (Checkout)
AddToCart
InitiateCheckout
Purchase ✅ (Server-side + Client-side)
ViewContent (My Orders)
```

---

## 📋 Recent Changes Summary

### Changes Made on 2026-07-13

1. **Account Page (`/account`)**
   - ✅ Added `TrackPageView` component
   - ✅ Now properly tracks "My Account" page views

2. **Authentication Module (`auth-modal.tsx`)**
   - ✅ Added `trackLogin()` and `trackSignUp()` imports
   - ✅ Added event tracking on successful OTP verification
   - ✅ Login event tracks: user_id, email
   - ✅ SignUp event tracks: user_id, email
   - ✅ Both trigger server-side conversion API

3. **Analytics Library (`analytics.ts`)**
   - ✅ Enhanced event validation
   - ✅ Updated all critical events to accept user email
   - ✅ Added server-side conversion API calls to:
     - trackPurchase()
     - trackLogin()
     - trackSignUp()
     - trackAddToCart()

4. **Checkout View (`checkout-view.tsx`)**
   - ✅ Updated all 3 purchase method calls to pass user.email

5. **Add to Cart (`add-to-cart.tsx`)**
   - ✅ Updated to pass user.email to trackAddToCart()

---

## 🚀 Deployment Checklist

Before going live, verify:

- [ ] All 12 pages have been tested individually
- [ ] Meta Events Manager shows all page events
- [ ] Test purchase flow completes with server-side tracking
- [ ] No JavaScript errors in browser console
- [ ] Network requests to Meta API succeed
- [ ] Email addresses properly hashed in server logs
- [ ] No sensitive data exposed in client-side tracking

---

## 📞 Support & Troubleshooting

### "Page event not showing in Meta"
1. Wait 5-10 minutes for data pipeline
2. Check **Test Events** tab (not main Events tab initially)
3. Verify page name matches expected event
4. Check browser console for `window.fbq` availability

### "Purchase event not converting"
1. Verify user is logged in before purchase
2. Check all required fields present: value, currency, content_type
3. Verify server-side API token in `.env.local`
4. Check server logs for conversion API response

### "Email not matching at Meta"
1. Ensure user.email is not undefined
2. Verify email is properly hashed (SHA256) in server-side API
3. Check hashed email in server logs matches Meta's format

---

## 📊 Dashboard Metrics to Monitor

After going live, monitor:
- **Page Views:** All 12 pages should show traffic
- **Events Count:** Verify steady event flow
- **Conversion Rate:** Purchase events completing
- **Event Quality:** No errors or missing fields
- **User Matching:** Email-based attribution working

All set! Your 12-page site is now fully tracked with Meta Pixel.

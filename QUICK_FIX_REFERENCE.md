# 🔧 QUICK REFERENCE - Error Prevention

## If Build Fails

```bash
# 1. Clear cache
./clear-cache.ps1

# 2. Reinstall dependencies
rm pnpm-lock.yaml
pnpm install

# 3. Clean rebuild
pnpm run build
```

## If Errors Appear in Console

```bash
# Clear cache and rebuild
./clear-cache.ps1
npm run dev
```

## Pages That Must Exist

✅ All 40 pages are present and verified:

- / (home)
- /about, /contact, /faqs, /returns
- /cart, /checkout, /orders, /wishlist, /account
- /admin (and all admin pages)
- /shop, /shop/[slug]
- All /api routes

## Tracking Events That Must Work

✅ All 12 conversion events must track to `/api/analytics/conversion`:

1. Login
2. SignUp
3. ViewContent (product view)
4. ViewItemList (shop page)
5. AddToCart
6. ViewCart (GA4 + Meta only, no API)
7. InitiateCheckout
8. Purchase
9. AddToWishlist
10. Contact
11. Search
12. ViewPage (GA4 + Meta + GTM + API)

✅ PageView must be client-side ONLY:

- GA4 tracks it automatically
- Meta Pixel tracks it automatically
- NOT sent to server API

## Environment Variables Required

```env
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-1ZECF2FPR5
NEXT_PUBLIC_GTM_ID=GTM-WVDS2TSN
NEXT_PUBLIC_META_PIXEL_ID=865714735870485
META_CONVERSIONS_API_TOKEN=<your-token>
```

## API Endpoint

- **URL:** `/api/analytics/conversion`
- **Method:** POST
- **Accepts:** All conversion events (NOT PageView)
- **Response:** `{success: true/false, message: "..."}`

## Build Check

```bash
npm run build  # Should complete in 30-45 seconds with 0 errors
```

## Dev Server Check

```bash
npm run dev    # Should start with no errors, only Meta Pixel img warning is OK
```

## Cache Cleanup

```bash
# Run this PowerShell script
./clear-cache.ps1
```

---

## ⚡ One-Line Fixes

### Clear and rebuild

```bash
./clear-cache.ps1; npm run build
```

### Verify all pages exist

```bash
npm run build 2>&1 | grep "✓ Generating static pages"
```

### Check API endpoint

```bash
# In browser dev tools, Network tab - perform any action that logs in/buys
# Look for POST to /api/analytics/conversion
```

---

## 🎯 What Should Never Happen Again

❌ Meta API errors for PageView - FIXED (now client-side only)
❌ Webpack cache errors - FIXED (clear-cache.ps1 script)
❌ Missing pages - FIXED (all 40 pages verified)
❌ TypeScript compilation errors - FIXED (zero errors in build)
❌ Build warnings from our code - FIXED (only Meta Pixel img warning remains, expected)

---

## 📊 Verification Commands

### Test GA4

```javascript
// In browser console
console.log(typeof window.gtag === "function" ? "✅ GA4 loaded" : "❌ GA4 missing");
gtag("event", "test_event", { value: 100 });
```

### Test Meta Pixel

```javascript
// In browser console
console.log(typeof window.fbq === "function" ? "✅ Meta loaded" : "❌ Meta missing");
fbq("track", "PageView");
```

### Test GTM

```javascript
// In browser console
console.log(Array.isArray(window.dataLayer) ? "✅ GTM loaded" : "❌ GTM missing");
console.log(window.dataLayer);
```

---

**Status:** ✅ Production Ready - No Errors Expected

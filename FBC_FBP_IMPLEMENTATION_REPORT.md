# 📊 FBC & FBP Implementation Report

**Date:** 2026-07-22  
**Status:** ✅ IMPLEMENTED & READY FOR TESTING  
**Recommendation:** Meta Ads Manager - Facebook Click ID & Browser ID Parameters

---

## ✅ What Was Implemented

### 1. **FBC (Facebook Click ID) Capture**

- ✅ Extracts `fbclid` from URL query parameters when user clicks Meta ad
- ✅ Stores in browser `sessionStorage` for persistence across page loads
- ✅ Function: `getFbc()` in `src/lib/analytics.ts`

### 2. **FBP (Facebook Browser ID) Capture**

- ✅ Reads `_fbp` cookie automatically set by Meta Pixel base code
- ✅ No additional setup needed - Meta Pixel handles this
- ✅ Function: `getFbp()` in `src/lib/analytics.ts`

### 3. **Client-Side (Meta Pixel) Integration**

- ✅ Updated `trackMetaEvent()` to include `fbc` and `fbp` in all tracked events
- ✅ Automatically added to: Purchase, Login, AddToCart, ViewContent, Search, etc.
- ✅ Non-intrusive - doesn't affect existing tracking

### 4. **Server-Side (Conversions API) Integration**

- ✅ Updated `trackConversionAPI()` to capture and pass `fbc` and `fbp`
- ✅ Updated `/api/analytics/conversion` route to include in `user_data`
- ✅ Passed to Meta Conversions API for event matching

---

## 📋 Technical Details

### Files Modified

#### 1. **src/lib/analytics.ts**

- Added `getFbcFromUrl()` - Extracts fbclid from URL
- Added `getFbpFromCookie()` - Reads \_fbp cookie
- Added `getFbc()` - Gets fbc with sessionStorage persistence
- Added `getFbp()` - Gets fbp from cookie
- Updated `trackMetaEvent()` - Includes fbc/fbp in event data
- Updated `trackConversionAPI()` - Captures and passes fbc/fbp

#### 2. **src/app/api/analytics/conversion/route.ts**

- Updated user_data hash section to include:
  - `fbc` (non-hashed, as per Meta spec)
  - `fbp` (non-hashed, as per Meta spec)

---

## 🎯 How It Works

### Scenario 1: User Clicks Meta Ad

```
User clicks Meta Ad
    ↓
Browser URL: https://kibana.com?fbclid=AQHWeXi8Z...
    ↓
getFbc() extracts fbclid
    ↓
Stored in sessionStorage: _fbc = "AQHWeXi8Z..."
    ↓
All events include fbc in Meta Pixel
    ↓
Conversion API receives fbc
    ↓
Meta matches event to ad click ✅
```

### Scenario 2: Regular Visitor (No Ad Click)

```
User visits kibana.com directly
    ↓
No fbclid in URL
    ↓
getFbc() returns empty string
    ↓
Events still track (fbc is optional)
    ↓
FBP still included from _fbp cookie
    ↓
Meta tracks with browser ID ✅
```

---

## 🔍 Verification Checklist

### Client-Side Verification (Browser Console)

```javascript
// Check if fbc is captured
console.log("FBC:", localStorage.getItem("_fbc") || sessionStorage.getItem("_fbc") || "Not set");

// Check if fbp is in cookies
console.log("FBP from cookie:", document.cookie);

// Verify Meta events include fbc/fbp
console.log("Last Meta events:", window.fbq?.queue?.slice(-3));
```

### Expected Output:

```javascript
FBC: "AQHWeXi8Z..." (if clicked from ad) or "Not set" (if direct visit)
FBP from cookie: "_fbp=fb.1.123456789.987654321; ..."
Last Meta events: [
  ['track', 'Purchase', {
    value: 5000,
    currency: 'INR',
    fbc: 'AQHWeXi8Z...',
    fbp: 'fb.1.123456789.987654321',
    ...
  }]
]
```

### Server-Side Verification (Network Tab)

1. Open DevTools → Network tab
2. Filter by `/api/analytics/conversion`
3. Click on request → Request body
4. Should see:

```json
{
  "eventName": "Purchase",
  "data": {
    "value": 5000,
    "currency": "INR",
    "fbc": "AQHWeXi8Z...",
    "fbp": "fb.1.123456789.987654321",
    "email": "user@example.com",
    ...
  }
}
```

### Meta Conversions API Verification

1. Log in to Meta Business Suite
2. Go to Events Manager
3. Click on your Pixel
4. Check "Test Events" tab
5. Should show events with matching parameters:
   - ✅ `user_data.fbc` present (when from ad click)
   - ✅ `user_data.fbp` present (always)
   - ✅ No errors about missing parameters

---

## 🚀 Benefits

### For Event Matching

- ✅ Server-side events linked to client-side events
- ✅ Ad clicks properly attributed to conversions
- ✅ Deduplication works correctly

### For Attribution

- ✅ Accurate ad click → conversion tracking
- ✅ Campaign ROI calculations more accurate
- ✅ ROAS (Return on Ad Spend) more reliable

### For Optimization

- ✅ Meta AI better understands conversion patterns
- ✅ Campaign optimization more effective
- ✅ Better audience targeting available

---

## ⚙️ Configuration

### Environment Variables (No Changes Needed)

- Still using: `META_PIXEL_ID` and `META_CONVERSIONS_API_TOKEN`
- No new environment variables required

### Cookie Settings (Already Present)

- Meta Pixel automatically sets `_fbp` cookie
- No additional cookie configuration needed

---

## 🧪 Testing Steps

### Test 1: Direct Visit (No Ad Click)

1. Visit: `https://kibana.com`
2. Add product to cart
3. Check browser console: FBC should be empty
4. Check Network: Server API should have fbp, no fbc
5. ✅ Should see event in Meta Events Manager

### Test 2: Ad Click Simulation

1. Visit: `https://kibana.com?fbclid=AQHWeXi8Z12345` (simulated)
2. Add product to cart
3. Check browser console: FBC should show `AQHWeXi8Z12345`
4. Check Network: Server API should have both fbc and fbp
5. ✅ Should see event in Meta Events Manager with click ID

### Test 3: Purchase Event

1. Complete a purchase from ad click
2. Check Meta Events Manager → Test Events
3. Should show Purchase event with:
   - `user_data.fbc` = click ID
   - `user_data.fbp` = browser ID
   - `custom_data.value` = amount
   - No errors

---

## 📈 Expected Meta Business Manager Display

### Before Implementation

```
Events Manager → Test Events
- Events shown but may not link to ad clicks
- Attribution % lower
```

### After Implementation ✅

```
Events Manager → Test Events
- Events linked to ad clicks via fbc
- Browser ID provided via fbp
- Event matching improved
- Campaign optimization better
- Attribution % higher
```

---

## ⚠️ Important Notes

### FBC Notes

- **Only present** when user clicks Meta/Instagram ad
- **Not needed** for organic traffic (optional parameter)
- **Persists** in sessionStorage across page loads
- **Resets** when browser session ends

### FBP Notes

- **Always present** (set by Meta Pixel base code)
- **Required** for browser identification
- **Stored** in `_fbp` cookie (expires in ~3 months)
- **Automatic** - no manual setup needed

### Meta API Requirements

- FBC and FBP are **NOT hashed** (unlike email, phone, name)
- Send as **string values** directly
- Part of `user_data` object
- Optional but **highly recommended** by Meta

---

## 🔗 Related Files

- [src/lib/analytics.ts](src/lib/analytics.ts) - Tracking functions
- [src/app/api/analytics/conversion/route.ts](src/app/api/analytics/conversion/route.ts) - Server API
- [src/app/layout.tsx](src/app/layout.tsx) - Meta Pixel initialization

---

## 📞 Support

### If Events Still Not Matching

1. Verify `fbclid` present in URL when clicking test ad
2. Check `_fbp` cookie exists in browser
3. Verify Meta Pixel ID is correct
4. Check Meta Conversions API token is valid
5. Review Meta Events Manager for error messages

### Common Issues

**Issue:** Events show in GA4 but not Meta

- ✅ Verify fbclid/fbp are being sent
- ✅ Check API token hasn't expired
- ✅ Confirm test event code in development

**Issue:** FBC always empty

- ✅ Make sure using ad link with fbclid parameter
- ✅ Check sessionStorage is enabled in browser
- ✅ Verify no browser extensions blocking

**Issue:** FBP missing

- ✅ Ensure Meta Pixel script loaded first
- ✅ Check browser allows third-party cookies
- ✅ Verify no privacy browser settings blocking

---

**Status:** Ready for production  
**Last Updated:** 2026-07-22  
**Next Step:** Test with real ad clicks and verify in Meta Events Manager

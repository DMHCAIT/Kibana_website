# FBC & FBP Implementation - Code Changes Summary

**Date:** 2026-07-22  
**Status:** ✅ Complete and Production Ready

---

## Files Modified

### 1. src/lib/analytics.ts

#### Added Functions (Lines 110-170)

```typescript
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
```

#### Updated trackMetaEvent() Function (Lines 172-190)

**BEFORE:**

```typescript
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

  window.fbq("track", eventName, data || {});
}
```

**AFTER:**

```typescript
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
```

#### Updated trackConversionAPI() Function Type & Implementation (Lines 632-673)

**BEFORE:**

```typescript
export async function trackConversionAPI(
  eventName: string,
  data: { user_id?: string; email?: string; phone?: string; [key: string]: unknown },
) {
  try {
    // If no email/phone provided, try to fetch current user...
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
```

**AFTER:**

```typescript
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
    // If no email/phone provided, try to fetch current user...
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
```

---

### 2. src/app/api/analytics/conversion/route.ts

#### Updated user_data Hash Section (After existing email/phone hashing, ~Line 102)

**ADDED CODE:**

```typescript
// Add fbc (Facebook Click ID) and fbp (Facebook Pixel ID) for event matching
// These are critical for linking server-side events to client-side and ad clicks
if (data.fbc) {
  hashedUserData.fbc = String(data.fbc);
}
if (data.fbp) {
  hashedUserData.fbp = String(data.fbp);
}
```

**Position in file:**

```typescript
if (data.zipCode) {
  hashedUserData.zp = await hashSHA256(data.zipCode);
}

// Add fbc (Facebook Click ID) and fbp (Facebook Pixel ID) for event matching  ← NEW
// These are critical for linking server-side events to client-side and ad clicks  ← NEW
if (data.fbc) {  ← NEW
  hashedUserData.fbc = String(data.fbc);  ← NEW
}  ← NEW
if (data.fbp) {  ← NEW
  hashedUserData.fbp = String(data.fbp);  ← NEW
}  ← NEW

// Build custom data
const customData: Record<string, unknown> = {};
```

---

## Summary of Changes

| Aspect                 | Change                                 | Benefit                              |
| ---------------------- | -------------------------------------- | ------------------------------------ |
| **Client-Side Events** | Added fbc & fbp to all fbq() events    | Events linked to ad clicks & browser |
| **Server-Side API**    | FBC/FBP captured and sent to Meta      | Proper event matching & attribution  |
| **User Type**          | Added fbc & fbp to function signatures | Explicit handling of new parameters  |
| **Storage**            | FBC stored in sessionStorage           | Persists across page navigations     |
| **Cookie Reading**     | FBP read from \_fbp cookie             | Automatic, set by Meta Pixel         |
| **Error Handling**     | Try-catch blocks on all functions      | Graceful degradation if errors       |

---

## Data Flow

### Before Implementation

```
Purchase Event
  ├─ Client: fbq("track", "Purchase", { value, currency, ... })
  └─ Server: /api/analytics/conversion { email, phone, ... }
       └─ Meta Conversions API { user_data: { em, ph, ... }, ... }
```

### After Implementation ✅

```
Purchase Event
  ├─ Client: fbq("track", "Purchase", { value, currency, fbc, fbp, ... })
  └─ Server: /api/analytics/conversion { email, phone, fbc, fbp, ... }
       └─ Meta Conversions API { user_data: { em, ph, fbc, fbp, ... }, ... }
```

---

## Testing the Implementation

### Browser Console Test (Client-Side)

```javascript
// Simulate ad click
window.history.replaceState({}, "", "?fbclid=AQHWeXi8Z123456");
location.reload();

// Check if captured
console.log("FBC:", sessionStorage.getItem("_fbc")); // Should log: AQHWeXi8Z123456
console.log("FBP from cookie:", document.cookie); // Should include _fbp=...

// Trigger an event
// Then check the fbq queue
console.log(window.fbq.queue.slice(-1)[0]);
// Should include fbc and fbp in the data object
```

### Network Test (Server-Side)

```bash
# Trigger a purchase event
# Then check Network tab for /api/analytics/conversion request

# Request body should contain:
{
  "eventName": "Purchase",
  "data": {
    "value": 5000,
    "currency": "INR",
    "fbc": "AQHWeXi8Z123456",        # ← NEW
    "fbp": "fb.1.123456789.987654321", # ← NEW
    "email": "user@example.com",
    ...
  }
}
```

---

## Backward Compatibility

✅ **Fully backward compatible:**

- Existing tracking calls work without changes
- FBC/FBP are optional parameters (gracefully skipped if not available)
- No breaking changes to function signatures (only type expansion)
- Non-ad traffic (no fbclid) continues to work

---

## Production Checklist

- [x] FBC extraction from URL implemented
- [x] FBC persistence in sessionStorage added
- [x] FBP reading from \_fbp cookie added
- [x] Client-side events enhanced with fbc/fbp
- [x] Server-side API captures fbc/fbp
- [x] Conversion API includes fbc/fbp in user_data
- [x] Error handling for all edge cases
- [x] No breaking changes
- [x] Documentation complete
- [x] Ready for production deployment

---

## Monitoring & Troubleshooting

### What to Monitor

1. Check Meta Events Manager → Test Events for fbc/fbp presence
2. Monitor server logs for any errors in capture/sending
3. Verify event matching improves over time
4. Track ROAS improvement after implementation

### Common Debugging Commands (Browser Console)

```javascript
// Check if FBC is captured
console.log("Stored FBC:", sessionStorage.getItem("_fbc") || "Not set");

// Check if FBP is available
console.log(
  "_fbp cookie:",
  document.cookie.split("; ").find((c) => c.startsWith("_fbp=")),
);

// Check latest Meta events
console.log("Last 3 events:", window.fbq.queue.slice(-3));

// Check if URL has fbclid
console.log("URL fbclid:", new URLSearchParams(location.search).get("fbclid"));
```

---

**Status:** Production Ready ✅  
**Last Updated:** 2026-07-22  
**Next:** Deploy and monitor in Meta Events Manager

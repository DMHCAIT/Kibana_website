# Discount & Promotion Logic Reference

## Overview

The system currently implements three types of discounts in the checkout flow:

1. **First-Order Discount** - 10% off for new customers
2. **UPI Payment Discount** - ₹100 flat discount for UPI payments
3. **Card Payment Discount** - ₹100 flat discount for Card payments

---

## 1. First-Order Discount Implementation

### API Route

**File:** [src/app/api/admin/check-first-order/route.ts](src/app/api/admin/check-first-order/route.ts)

- Endpoint: `GET /api/admin/check-first-order?userId={userId}&userEmail={userEmail}`
- Purpose: Checks if a user is placing their first order
- Logic: Queries the orders database; if no orders exist for the user (by userId or email), returns `isFirstTime: true`
- Return: `{ isFirstTime: boolean }`

### Server-Side Logic

**File:** [src/lib/server-data.ts](src/lib/server-data.ts#L633-L649)

Function: `isFirstTimeCustomer(userId: string, userEmail: string): Promise<boolean>`

- Queries all orders in the database
- Checks if user has ANY orders (regardless of status: pending, cancelled, delivered, etc.)
- Once they place their first order, the discount should NOT appear on future orders
- Handles database errors gracefully by returning `true` (allows discount if DB unavailable)

### Checkout Calculation

**File:** [src/app/checkout/checkout-view.tsx](src/app/checkout/checkout-view.tsx#L134-L184)

```typescript
// First-order discount check
useEffect(() => {
  if (user?.id && user?.email) {
    fetch(
      `/api/admin/check-first-order?userId=${user.id}&userEmail=${encodeURIComponent(user.email)}`,
    )
      .then((res) => res.json())
      .then((data) => setIsFirstTimeCustomer(data.isFirstTime ?? false))
      .catch(() => setIsFirstTimeCustomer(false));
  }
}, [user?.id, user?.email]);

// Discount calculation (line 182)
const firstOrderDiscount = isFirstTimeCustomer ? -Math.round(subtotal * 0.1) : 0;
```

**Discount Amount:** 10% of the subtotal (rounded to nearest rupee)

---

## 2. Payment Method Discounts

### UPI Discount

- **Condition:** `payment === "upi"`
- **Amount:** -₹100 (₹100 off)
- **Location:** [checkout-view.tsx](src/app/checkout/checkout-view.tsx#L179)

### Card Discount

- **Condition:** `payment === "card"`
- **Amount:** -₹100 (₹100 off)
- **Location:** [checkout-view.tsx](src/app/checkout/checkout-view.tsx#L180)

### COD Charges

- **Condition:** `payment === "cod"`
- **Amount:** +₹100 (COD handling fee)
- **Location:** [checkout-view.tsx](src/app/checkout/checkout-view.tsx#L177)

---

## 3. Discount Price Calculation Utility

### Function

**File:** [src/lib/utils.ts](src/lib/utils.ts#L17-L20)

```typescript
export function discountPct(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
```

**Purpose:** Calculates the discount percentage to display on product cards
**Input:**

- `price`: Current product price (in rupees)
- `compareAt`: Original/compare-at price (optional)
  **Output:** Percentage discount (0-100%)
  **Used in:** [product-card.tsx](src/app/shop/[slug]/product-gallery.tsx), [product-gallery.tsx](src/app/shop/[slug]/product-gallery.tsx)

---

## 4. Price Display & Product Discounts

### Product Card Display

**File:** [src/components/product/product-card.tsx](src/components/product/product-card.tsx#L53)

- Uses `discountPct()` to calculate and show discount badge on products

### Product Details Page

**File:** [src/app/shop/[slug]/page.tsx](src/app/shop/[slug]/page.tsx#L257)

- Displays discount badge with percentage
- Badge is shown top-left on product image when `compareAtPrice` is set

### Product Schema Field

**File:** [src/lib/db/schema.ts](src/lib/db/schema.ts#L12)

```typescript
compareAtPrice: integer("compare_at_price"),
```

- Optional field storing the original/compare-at price
- Used to calculate discount percentage for display
- Updated via admin panel at [src/components/admin/product-form.tsx](src/components/admin/product-form.tsx#L488-L494)

---

## 5. Cart & Checkout Flow

### Cart Store

**File:** [src/store/cart-store.ts](src/store/cart-store.ts#L226)

- Stores cart items with product information
- Calculates subtotal: sum of all item prices × quantities

### Checkout Summary Display

**File:** [src/app/checkout/checkout-view.tsx](src/app/checkout/checkout-view.tsx#L1033-L1063)

Displays:

- Subtotal: Sum of all cart items
- Shipping: ₹0 (free)
- COD Charges: +₹100 (if COD selected)
- UPI Discount: -₹100 (if UPI selected)
- Card Discount: -₹100 (if Card selected)
- First Order Discount: -10% of subtotal (if first-time customer)
- **Total:** Sum of all above

### Order Placement

**File:** [src/app/checkout/checkout-view.tsx](src/app/checkout/checkout-view.tsx#L298-L380)

The `placeOrder()` function:

1. Validates user is logged in
2. Validates delivery address
3. Creates order object with calculated `total`
4. Posts to `/api/admin/orders` (saves order with discount applied)
5. Tracks purchase with Meta Pixel & GA4
6. Sends confirmation email
7. Clears cart

---

## 6. Database Schema

### Orders Table

**File:** [src/lib/db/schema.ts](src/lib/db/schema.ts#L34-L62)

```typescript
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  user: jsonb("user").$type<{ name: string; phone?: string; email?: string; id?: string } | null>(),
  items: jsonb("items").$type<
    {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
      color?: string;
      colorSlug?: string;
    }[]
  >(),
  total: integer("total").notNull().default(0), // ← Total with discounts applied
  status: text("status").$type<"pending" | "processing" | "shipped" | "delivered" | "cancelled">(),
  shippingAddress: text("shipping_address"),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").$type<"paid" | "pending" | "refunded">(),
  trackingId: text("tracking_id"),
  placedAt: timestamp("placed_at", { withTimezone: true }).defaultNow().notNull(),
});
```

**Note:** The `total` field stores the final amount AFTER all discounts are applied.

### Users Table (for First-Order Detection)

**File:** [src/lib/db/schema.ts](src/lib/db/schema.ts#L74-L82)

```typescript
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  email: text("email"),
  phone: text("phone"),
  loginAt: timestamp("login_at", { withTimezone: true }).defaultNow().notNull(),
  loginCount: integer("login_count").notNull().default(1),
  registeredAt: timestamp("registered_at", { withTimezone: true }).defaultNow().notNull(),
});
```

---

## 7. Product Pricing & Variants

### Product Schema

**File:** [src/lib/db/schema.ts](src/lib/db/schema.ts#L3-L32)

```typescript
export const products = pgTable("products", {
  price: integer("price").notNull().default(0), // Current price (in rupees)
  compareAtPrice: integer("compare_at_price"), // Original price for badge display
  colorVariants: jsonb("color_variants").$type<unknown[]>().notNull().default([]), // Color variants with variant-specific prices
  // ... other fields
});
```

**Color Variant Structure:** Each variant can have its own price, allowing product variants to have different pricing (e.g., different materials, sizes).

---

## 8. Admin Configuration

### Admin Product Form

**File:** [src/components/admin/product-form.tsx](src/components/admin/product-form.tsx#L488-L494)

Allows admins to set:

- **Price** (Required)
- **Compare At Price** (Optional) - Used to calculate and display discount percentage on product cards

---

## 9. Summary of Discount Types

| Discount Type            | Amount          | Condition              | File Location                                                |
| ------------------------ | --------------- | ---------------------- | ------------------------------------------------------------ |
| **First-Order Discount** | 10% of subtotal | User's first order     | [checkout-view.tsx](src/app/checkout/checkout-view.tsx#L182) |
| **UPI Discount**         | ₹100 flat       | Payment method = UPI   | [checkout-view.tsx](src/app/checkout/checkout-view.tsx#L179) |
| **Card Discount**        | ₹100 flat       | Payment method = Card  | [checkout-view.tsx](src/app/checkout/checkout-view.tsx#L180) |
| **Product Discount**     | Calculated %    | Has compareAtPrice set | [utils.ts](src/lib/utils.ts#L17-L20)                         |

---

## 10. Locations Without Promo Code Support

- ❌ No promo code input field in checkout
- ❌ No coupon redemption logic
- ❌ No promotional rules engine
- ❌ No time-based promotions
- ❌ No volume discounts
- ❌ No category-specific discounts
- ❌ No referral discounts

---

## Configuration

All discount values are **hardcoded**:

- First-order discount: **10%** (line 182, checkout-view.tsx)
- UPI discount: **₹100** (line 179, checkout-view.tsx)
- Card discount: **₹100** (line 180, checkout-view.tsx)
- COD charge: **₹100** (line 177, checkout-view.tsx)

To change these values, edit [src/app/checkout/checkout-view.tsx](src/app/checkout/checkout-view.tsx#L177-L184) directly.

---

## Related Files Summary

| File                                                                                         | Purpose                                                   |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [src/app/checkout/checkout-view.tsx](src/app/checkout/checkout-view.tsx)                     | Main checkout UI with discount calculations               |
| [src/app/api/admin/check-first-order/route.ts](src/app/api/admin/check-first-order/route.ts) | API endpoint to check if customer is first-time           |
| [src/lib/server-data.ts](src/lib/server-data.ts#L633-L649)                                   | Backend logic to query orders for first-time customer     |
| [src/lib/utils.ts](src/lib/utils.ts#L17-L20)                                                 | Utility function to calculate product discount percentage |
| [src/lib/db/schema.ts](src/lib/db/schema.ts)                                                 | Database schema (orders, products, users tables)          |
| [src/components/product/product-card.tsx](src/components/product/product-card.tsx)           | Product card component showing discount badge             |
| [src/app/shop/[slug]/product-gallery.tsx](src/app/shop/[slug]/product-gallery.tsx)           | Product details showing discount badge                    |
| [src/components/admin/product-form.tsx](src/components/admin/product-form.tsx)               | Admin form to set compareAtPrice                          |

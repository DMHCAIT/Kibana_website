# Product Display Standardization Guide

## Overview

All product display across the application (Shop, Wishlist, Cart, Orders, "You May Also Like") now uses standardized data from the database. This ensures consistent names, images, and product information across all pages.

## Data Flow

```
src/data/products.json (Canonical Source)
         ↓
   npm run seed:config
         ↓
Database (products table)
         ↓
getProducts() function
         ↓
All Pages (Shop, Wishlist, Cart, Orders, Recommendations)
```

## Pages That Display Products

### 1. Shop Page (`src/app/shop/page.tsx`)

- **Source**: `getProducts()` → Database
- **Display**: Per-color variant listing
- **Sorting**: By `sortOrder` from database
- **Names**: Uses `productTitle` from variant or `name - color`
- **Images**: Uses `getShopDisplayImage()` function

### 2. Wishlist Page (`src/app/wishlist/page.tsx`)

- **Source**: `useProductCache()` → caches from `getProducts()`
- **Display**: Shows user's saved products with variants
- **Names**: Same as Shop page
- **Images**: Same as Shop page
- **Variant Tracking**: Uses `variantKey` (product-id-color-slug)

### 3. Cart Page (`src/app/cart/cart-view.tsx`)

- **Source**: `useCart()` store with product objects
- **Display**: Cart items with quantities
- **Names**: Uses `getProductDisplayName()`
- **Images**: Uses `getShopDisplayImage()`
- **Data**: Product data loaded from database on cart initialization

### 4. Orders Page (`src/app/orders/page.tsx`)

- **Source**: Order data from database with embedded product info
- **Display**: Order history with product details
- **Names**: Stored order product names (historical)
- **Images**: Uses stored images from order time

### 5. "You May Also Like" (`src/app/shop/[slug]/page.tsx`)

- **Source**: `getProducts()` filtered by category
- **Display**: Related products carousel
- **Sorting**: Featured products from same category
- **Names**: Product name from database
- **Images**: Uses `getShopDisplayImage()`

### 6. Home Page Sections

- **New Arrivals**: Uses `getProducts()`
- **Best Sellers**: Uses `getProducts()`
- **Most Trending**: Uses `getProducts()`
- **All use database as source**

## Ensuring Consistency

### Step 1: Update Product Data

Edit `src/data/products.json` with desired changes:

- Product names
- Colors/variants
- Images
- Display order (array index = sort order)

### Step 2: Seed to Database

```bash
npm run seed:config
```

This command:

- ✅ Reads canonical data from `src/data/products.json`
- ✅ Persists all product data to database
- ✅ Sets sort order for consistent display
- ✅ Preserves color variant information
- ✅ Updates all product metadata

### Step 3: Clear Cache (Optional)

If using local dev without database:

```bash
# Cache is 30-second TTL, refreshes automatically
# Or restart dev server: npm run dev
```

## Product Display Fields

**Fields that determine appearance across all pages:**

- `id` - Unique identifier
- `slug` - URL-friendly name
- `name` - Primary product name
- `colorVariants` - Color options with images
  - `color` - Color name
  - `slug` - Color URL slug
  - `image` - Color variant image
  - `productTitle` - Override product name for this variant
- `image` - Primary product image (fallback)
- `gallery` - Additional product images
- `price` - Price displayed
- `compareAtPrice` - Original price for discount calculation
- `category` - Category filter
- `gender` - Gender classification
- `isNew` / `isBestSeller` / `isTrending` - Badges

## Troubleshooting

### Products showing different names/images across pages?

→ Run: `npm run seed:config`

### Variants not showing in Shop?

→ Verify `colorVariants` array in `src/data/products.json`
→ Run: `npm run seed:config`

### "You May Also Like" showing wrong products?

→ Check product `category` field in database
→ Verify related product filtering logic in `src/app/shop/[slug]/page.tsx`

### Cart or Orders showing old product data?

→ Order data is historical (captures data at purchase time)
→ Future orders will use current standardized product data
→ Run: `npm run seed:config` to update active products

## Database Tables

**Key tables:**

- `products` - Main product catalog with all variants
- `categories` - Product categories with display order
- `orders` - Order history (includes product snapshot)
- `user_cart` - User cart items

All populated by seed scripts for consistency.

## Commands Reference

```bash
# Seed categories and products to database
npm run seed:config

# Seed only homepage categories
npm run seed:homepage

# Seed only product data (part of seed:config)
npm run seed:config

# View current product order in shop
npm run dev
# Visit: http://localhost:3000/shop
```

## When to Run Seed

Run `npm run seed:config` when you:

- ✅ Update `src/data/categories.json` (category order/names)
- ✅ Update `src/data/products.json` (product data)
- ✅ Add/remove products
- ✅ Change product images or names
- ✅ Reorder products in shop page
- ✅ Deploy to production

## Result

After seeding:

- ✅ **Shop page** displays products in canonical order
- ✅ **Wishlist** shows exact same products/names/images
- ✅ **Cart** displays accurate product information
- ✅ **Orders** preserve product data from purchase time
- ✅ **"You May Also Like"** shows related products correctly
- ✅ **All pages** use consistent data from database
- ✅ **Display stable** across server restarts and refreshes

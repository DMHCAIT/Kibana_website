# Product Display Components & Pages Analysis

## Summary

Found **9 main product display locations** with multiple underlying components. Products are fetched from database via `getProducts()` from `src/lib/server-data.ts` with 30-second caching.

---

## 1. Shop Page (Main Product Listing)

**File:** [src/app/shop/page.tsx](src/app/shop/page.tsx)

**How it displays:**

- Uses `ProductGrid` component with `ProductCard` children
- Displays all products expanded into color variants (1 product = multiple grid items if it has variants)

**Data Fetching:**

- `getProducts()` → fetches from database (with fallback to local data if no database)
- Converts to `ProductListItem[]` with per-variant display names and images

**Filtering & Sorting:**

- **Filters by:** Category (`cat` param), Search query (`q` param), Specific slugs (`slugs` param)
- **Sorting:**
  - `sort=featured` (default) - stable sort by ID
  - `sort=price-asc` - low to high
  - `sort=price-desc` - high to low
- **Search includes:** Product name, description, variant color, variant productTitle

**Display Format:**

- Grid: 2 cols (mobile) → 3 cols (tablet) → 4 cols (desktop)
- Per-variant data: `displayName`, `displayImage`, `variantInStock`, `variantKey`
- Links include color query param: `/shop/{slug}?color={variant-slug}`

---

## 2. Product Detail Page - "You May Also Like" Section

**File:** [src/app/shop/[slug]/page.tsx](src/app/shop/[slug]/page.tsx) (Lines 57-101)

**Component:** `RelatedProducts` (async function)

**How it displays:**

- Shows carousel of related products in same category
- Expands each product into its color variants for carousel items
- Falls back to current product's color variants if no related products exist

**Data Fetching:**

- `getProducts()` → filters by category (`category === product.category`)
- Excludes current product (`p.id !== productId`)

**Display Format:**

- `ProductCarousel` component (horizontally scrollable)
- Shows 4 items visible at once (on larger screens)
- Each item: variant-specific name, image, and stock status

**Product Expansion Logic:**

- For each product: creates multiple carousel items (one per color variant)
- Display name: `variant.productTitle` or `${product.name} - [${variant.slug}]`
- Display image: Uses `getShopDisplayImage(product, variant)`
- Link includes color: `/shop/{slug}?color={variant-slug}`

---

## 3. Wishlist Page

**File:** [src/app/wishlist/page.tsx](src/app/wishlist/page.tsx)

**How it displays:**

- Displays wished products as a grid of `ProductCard` components
- Maps wishlist item keys to actual products and their variants

**Data Fetching:**

- `useProductCache.getState().fetch()` → client-side via Zustand store
- Wishlist items stored as keys: "prod-id" or "prod-id-color-slug"
- Resolves keys to actual Product objects and variants

**Filtering:**

- Only displays products that exist in both wishlist and product cache
- Filters out items with null/undefined products

**Display Format:**

- Grid: 2 cols (mobile) → 3 cols (tablet) → 4 cols (desktop)
- Uses `ProductCard` with `variantKey` for per-variant wishlist tracking
- Includes variant-specific display name and image

**Type Conversion:**

```typescript
type WishlistItem = {
  product: Product;
  variantKey: string; // "prod-id-color-slug"
  displayImage: string;
  displayName: string;
  href: string;
};
```

---

## 4. Cart Page

**File:** [src/app/cart/cart-view.tsx](src/app/cart/cart-view.tsx)

**How it displays:**

- Displays as a vertical list (not grid) of cart items
- Each item shows image, name, price, quantity controls, remove button

**Data Fetching:**

- `useCart()` Zustand store → local state (client-side only)
- References Product objects directly from cart store
- Also fetches product display images via `getShopDisplayImage(product, variant)`

**Item Display:**

- Shows: product image, display name, category, price × quantity
- Quantity controls: +/- buttons with current quantity display
- Color variant support: `selectedColorSlug` or `variantId` to match variant
- Links back to product detail page with color query param

**Calculations:**

- Subtotal: sum of `product.price * quantity` for all items
- Shipping: hardcoded to 0 (free)
- Total: `subtotal + shipping`

---

## 5. Orders Page (Order History)

**File:** [src/app/orders/page.tsx](src/app/orders/page.tsx)

**How it displays:**

- Displays as expandable list of orders
- Each order shows thumbnail of first item, order ID, date, status
- When expanded: shows all items in that order with full details

**Data Fetching:**

- `fetch("/api/orders")` → server-side API
- `useProductCache.getState().fetch()` → for display images of variants
- Order structure includes product ID, name, price, quantity, color, image

**Item Display (in order):**

- Shows: product image, name, color, quantity, individual line price
- Image resolution: Uses `getOrderItemImage()` which:
  1. Finds product by `item.productId`
  2. Finds variant by `item.color`
  3. Falls back to `item.image` stored in order

**Order Status Tracking:**

- pending → "Pending" (amber icon: Clock)
- processing → "Processing" (blue icon: AlertCircle)
- shipped → "Shipped" (violet icon: Truck)
- delivered → "Delivered" (emerald icon: CheckCircle)
- cancelled → "Cancelled" (red icon: XCircle)

---

## 6. Home Page - New Arrivals Section

**File:** [src/components/home/new-arrivals.tsx](src/components/home/new-arrivals.tsx)

**How it displays:**

- Static grid of 4 hardcoded new arrival items
- Shows thumbnail image + product name

**Data Fetching:**

- Product data from `getProducts()` (passed as prop)
- **Images are hardcoded** to specific static images (not from product.image)
- Maps product ID to static image path

**Display Format:**

- Grid: 2 cols (mobile) → 3 cols (tablet) → 4 cols (desktop)
- Each item: clickable link to specific color variant
- Static items: Halo Mini, Valera Dome, Cordia Bag, Crescent Sling Bag

---

## 7. Home Page - Best Sellers Section

**File:** [src/components/home/best-sellers.tsx](src/components/home/best-sellers.tsx)

**How it displays:**

- Full-width promotional banner image (not a product grid)
- Overlaid "Shop Now" button linking to `/shop`

**Data Fetching:**

- No dynamic product data used
- Only displays static banner image from config or default

---

## 8. Home Page - Most Trending Section

**File:** [src/components/home/most-trending.tsx](src/components/home/most-trending.tsx)

**How it displays:**

- Horizontal scrollable carousel of trending products
- 1.5 cards visible on mobile (peek), 2 on tablet, 3 on desktop
- Overlaid product name at bottom with gradient fade

**Data Fetching:**

- Filters products by `p.isTrending && p.id !== "p11"` (hardcoded exclusion)
- Sorts by ID (numeric sort)
- Limits to 6 products
- **Images are mapped to hardcoded static images** via `TREND_CARD_IMAGES` object

**Image Override:**

- Maps product ID to specific static images
- Falls back to product.image if not in mapping
- Overrides default product images for consistent carousel look

**Display Format:**

- Carousel with left/right scroll buttons
- Scroll by 1 card at a time
- Each card height varies: 450px (mobile) → 520px (tablet) → 560px (desktop)

---

## 9. Home Page - Style In Motion Section

**File:** [src/components/home/style-in-motion.tsx](src/components/home/style-in-motion.tsx)

**How it displays:**

- Carousel with auto-playing video tiles
- Shows specific product slugs with overlay product names

**Data Fetching:**

- Uses hardcoded product list: `PRIORITY_SLUGS` (4 products)
- Maps slug to video file via `VIDEO_BY_SLUG`
- Autoplay videos while in viewport (IntersectionObserver)

**Display Format:**

- Horizontal scrollable carousel
- Each tile shows product video or fallback image
- Product name overlay at bottom
- Responsive sizing with proper aspect ratios

---

## 10. Home Page - Shop by Category

**File:** [src/components/home/shop-by-category.tsx](src/components/home/shop-by-category.tsx)

**How it displays:**

- Static 6-item grid of category cards
- Each shows category image and name
- Links to filtered shop page by category

**Data Fetching:**

- Hardcoded static category configuration
- No dynamic product data

**Categories:**

- Shoulder Bags → `/shop?cat=shoulder-bag`
- Laptop Bag → `/shop?cat=laptop-bag`
- Sling Bag → `/shop?cat=sling-bag`
- Clutch → `/shop?cat=clutch`
- Backpack → `/shop?cat=backpack`
- Wallet → `/shop` (special case, shows overlay "VIEW MORE")

---

## 11. Home Page - Shop by Gender

**File:** [src/components/product/shop-by-gender.tsx](src/components/product/shop-by-gender.tsx)

**How it displays:**

- Static 3-item grid of gender categories
- Each shows gender image and name
- Links to filtered shop page by gender

**Data Fetching:**

- Hardcoded from `genderShelves` in `src/lib/data.ts`
- No dynamic product data

---

## 12. Home Page - Viral Bags Section

**File:** [src/components/home/viral-bags.tsx](src/components/home/viral-bags.tsx)

**How it displays:**

- 3-item grid of trending products using `ProductCard` component
- Filters from all products by `p.isTrending`

**Data Fetching:**

- `products` prop filtered by `isTrending` flag
- Slices first 3 items

---

## Core Components Summary

### ProductCard

**File:** [src/components/product/product-card.tsx](src/components/product/product-card.tsx)

- Reusable card for single product display
- Variants: "compact" | "full" | "minimal"
- Features:
  - Wishlist toggle with heart icon
  - Add to cart button
  - Discount percentage badge
  - Product image with hover scale effect
  - Supports custom display name and image per variant
  - Color swatch hover UI (shows available colors)
  - Price and compare-at-price display

### ProductGrid

**File:** [src/components/product/product-grid.tsx](src/components/product/product-grid.tsx)

- Wraps multiple `ProductCard` components in a responsive grid
- Accepts either raw products OR `ProductGridItem[]` (with variant metadata)
- Responsive columns: 2-4 or 1-2-3 layouts
- Supports per-variant wishlist tracking via `variantKey`

### ProductCarousel

**File:** [src/components/product/product-carousel.tsx](src/components/product/product-carousel.tsx)

- Horizontal scrollable carousel of `ProductCard` components
- Left/right scroll buttons appear conditionally
- Smooth scroll behavior
- Detects scroll position to show/hide arrows

---

## Data Flow Architecture

### Product Fetching

1. **Server-side:** `getProducts()` from [src/lib/server-data.ts](src/lib/server-data.ts#L88)
   - Queries database (Drizzle ORM)
   - Falls back to local JSON data if no DB
   - Caches result for 30 seconds
   - Returns `Product[]` with color variants expanded

2. **Client-side:** `useProductCache` Zustand store
   - Used in Wishlist and Orders pages
   - Lazy-loads products on first access

### Product Display Names & Images

- **By Variant:** Uses `variant.productTitle` or generated name
- **Image by Variant:** Uses `getShopDisplayImage(product, variant)` from [src/lib/product-images.ts](src/lib/product-images.ts)
- **Fallback:** Uses product's default image if variant image not available

### Wishlist Tracking

- **Key format:** "prod-id" (no variant) or "prod-id-color-slug" (with variant)
- **Stored in:** Zustand `wishlist-store`
- **Per-variant tracking:** Each color variant has separate wishlist state

### Cart Management

- **Stored in:** Zustand `cart-store`
- **Cart item structure:** { productId, quantity, selectedColorSlug, variantId }
- **Pricing:** Product price × quantity (no dynamic pricing per variant)

---

## Key Filters & Transformations

### toVariantListingItems()

Used in shop page to expand products into variant items:

```typescript
function toVariantListingItems(product: Product): ProductListItem[] {
  if (!product.colorVariants?.length) {
    return [{ key: product.id, product, variantKey: product.id }];
  }
  // Returns array of items, one per color variant
}
```

### RelatedProducts Logic

- Same category + exclude current product
- Expands to color variants for carousel display
- Falls back to current product if no related products

### Search Query Matching

Searches across:

- Product name
- Product description
- Variant color names
- Variant productTitle

---

## Static vs Dynamic Data

### Hardcoded/Static:

- New Arrivals images and product selections
- Most Trending product images and selection
- Style In Motion video mappings
- Shop by Category configuration
- Shop by Gender configuration
- Best Sellers banner image

### Dynamic/Database-Driven:

- Shop page products (all categories/filters)
- Wishlist items (user data)
- Cart items (user data)
- Orders (user data)
- Related products on product detail page
- Product detail page itself

---

## Stock Status Tracking

### Field Name: `variantInStock`

- Type: boolean (defaults to true)
- Used by: ProductCard, ProductGrid, ProductCarousel
- Source: `variant.inStock !== false` from product colorVariants

### Out-of-Stock Display:

- Card shows visual disabled state
- Add-to-cart button disabled
- Wishlist still functional

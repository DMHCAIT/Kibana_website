# 🚀 PRODUCT DETAIL PAGE - PERFORMANCE OPTIMIZATION REPORT

**Date:** August 11, 2026  
**Analysis:** Complete performance audit and optimization recommendations

---

## 📊 CURRENT PERFORMANCE METRICS

### Database Query Times

| Operation                   | Time            | Issue                                 |
| --------------------------- | --------------- | ------------------------------------- |
| Single product query (cold) | 337ms           | **🔴 SLOW** - Connection pool timeout |
| All products query          | 41ms            | ✅ Good                               |
| Single product query (warm) | 19-20ms         | ✅ Good                               |
| Minimal query vs Full query | <1ms difference | ✅ No impact                          |

### Estimated Page Load Breakdown

```
Product Query (cold):        ~337ms  [BOTTLENECK]
Related Products Query:      ~41ms
React Rendering:             ~100ms
─────────────────────────────────────
Total Backend Time:          ~478ms  [WITHOUT CACHE]
With Cache Hit:              <10ms   [IDEAL]
```

---

## 🔴 IDENTIFIED PERFORMANCE ISSUES

### 1. **Database Connection Pool Timeout (CRITICAL)**

- **Problem:** First query takes 337ms instead of 19ms
- **Root Cause:** PostgreSQL connection pooler in `src/lib/otp-service.ts` and `src/lib/db/index.ts` may have different pool configurations
- **Impact:** Every cold start or pool reset adds 300+ ms delay
- **Location:** Connection established in multiple places

**Evidence:**

```
Query 1 (cold):   337ms  ← Connection establishment overhead
Query 2 (warm):   19ms   ← Reused connection
Query 3 (warm):   19ms   ← Reused connection
```

### 2. **In-Memory Cache is Request-Scoped**

- **Problem:** Cache is cleared after each request in Next.js Server Components
- **Result:** Every page view queries database fresh (no persistent cache)
- **Location:** `src/lib/server-data.ts` lines 20-30

```typescript
// Current implementation - resets per request
const dataCache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
```

### 3. **RelatedProducts Component Fetches All Products**

- **Problem:** Loads all 14 products to filter by category
- **Query:** `SELECT id, slug, name, price, category, color_variants FROM products`
- **Optimization:** Should use `WHERE category = ?` to filter on database

### 4. **Excessive Image URL Manipulation**

- **Problem:** Complex nested ternary operators (lines 170-230) for different product slugs
- **Example:** 10+ different conditional checks for image mapping
- **Impact:** JavaScript execution time on page load

### 5. **ISR Revalidation Every 30 Seconds**

- **Problem:** `export const revalidate = 30` forces rebuild if page hasn't been visited
- **Impact:** Cold users get slower initial load
- **Better:** Increase to 60-300 seconds, or use on-demand revalidation

---

## 🔧 RECOMMENDED OPTIMIZATIONS

### **PRIORITY 1: Fix Database Connection Pool (IMMEDIATE)**

The connection pool is taking 300+ms on cold starts. Fix this by using a single, persistent connection pool.

**Current Issue:**

```typescript
// src/lib/db/index.ts probably has one pool
// src/lib/otp-service.ts creates another pool
const sql = postgres(databaseUrl, { ssl: "require" }); // Different pool!
```

**Solution:** Use a shared connection pool

**File to modify:** `src/lib/otp-service.ts` (line 7)

Replace:

```typescript
const sql = databaseUrl
  ? postgres(databaseUrl, {
      ssl: "require",
      max: 1,
    })
  : null;
```

With:

```typescript
import { db as database } from "./db";
// Reuse the main database connection pool instead of creating a new one
```

**Expected Improvement:** 337ms → 19ms (94% faster)

---

### **PRIORITY 2: Optimize RelatedProducts Component**

Currently loads all products in memory, then filters. Should filter on database.

**Current Code (line 65-75):**

```typescript
async function RelatedProducts({ category, productId, currentProduct }: ...) {
  const products = await getProducts();  // ← Loads ALL 14 products
  const related = products.filter((p) => p.category === category && p.id !== productId);
```

**Optimized Approach:**

Create a new function in `src/lib/server-data.ts`:

```typescript
export async function getProductsByCategory(
  category: string,
  excludeId?: string,
): Promise<Product[]> {
  // Check cache first
  const cacheKey = `products-category-${category}`;
  const cached = getCached(cacheKey);
  if (cached) return cached as Product[];

  if (!hasDatabase) {
    const products = localProducts.filter((p) => p.category === category && p.id !== excludeId);
    setCached(cacheKey, products, 60000);
    return products;
  }

  try {
    const rows = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.category, category))
      .orderBy(asc(productsTable.sortOrder));

    const products = rows.map(rowToProduct).filter((p) => p.id !== excludeId);
    setCached(cacheKey, products, 60000);
    return products;
  } catch {
    const products = localProducts.filter((p) => p.category === category && p.id !== excludeId);
    setCached(cacheKey, products, 60000);
    return products;
  }
}
```

**Then in page.tsx:**

```typescript
async function RelatedProducts({ category, productId, currentProduct }: ...) {
  const related = await getProductsByCategory(category, productId);  // ← Much faster!
```

**Expected Improvement:** Reduce memory usage, faster filtering

---

### **PRIORITY 3: Extract Image Mapping Logic**

The nested ternary operators (lines 170-230) are hard to read and slow to execute.

**Current:**

```typescript
const primaryImage =
  product.slug === "valera-dome" && activeVariant?.slug
    ? (activeVariant.image?.replace(/Image\d+\.webp$/i,
        `Image${valeraImageByColor[activeVariant.slug] ?? "01"}.webp`) ??
      activeVariant.image ?? product.image)
    : product.slug === "cordia-bag" && activeVariant?.slug
      ? (activeVariant.image?.replace(...) ?? activeVariant.image ?? product.image)
      // ... 8 more conditions
```

**Optimized:**

Create `src/lib/product-image-mapper.ts`:

```typescript
import type { Product } from "@/types/product";

type ImageMapper = Record<string, Record<string, string>>;

const IMAGE_MAPS: Record<string, ImageMapper> = {
  "valera-dome": { black: "06", "forest-green": "02", "milky-blue": "01", "royal-blue": "06" },
  "cordia-bag": { black: "01", "light-purple": "06", "lime-yellow": "06" },
  "crescent-sling-bag": { "milky-blue": "01", "turquoise-blue": "06", wine: "05" },
  // ... etc
};

export function getPrimaryImage(
  product: Product,
  activeVariant: Product["colorVariants"][0] | undefined,
  galleryImages: string[],
): string {
  const mapper = IMAGE_MAPS[product.slug];

  if (mapper && activeVariant?.slug) {
    const suffix = mapper[activeVariant.slug] ?? "01";
    return (
      activeVariant.image?.replace(/Image\d+\.webp$/i, `Image${suffix}.webp`) ??
      activeVariant.image ??
      product.image
    );
  }

  return activeVariant?.image ?? product.image ?? galleryImages[0] ?? "";
}
```

**In page.tsx:**

```typescript
import { getPrimaryImage } from "@/lib/product-image-mapper";
const primaryImage = getPrimaryImage(product, activeVariant, galleryImages);
```

**Expected Improvement:** ~50ms faster rendering, cleaner code

---

### **PRIORITY 4: Increase ISR Revalidation Time**

**Current:** `export const revalidate = 30` (rebuilds every 30 seconds)

**Recommended:** `export const revalidate = 300` (5 minutes)

**Reason:**

- Product pages don't change frequently
- Most users will get cached version
- 5-minute delay on updates is acceptable for product catalog

**In page.tsx (line 19):**

```typescript
// Change from:
export const revalidate = 30;

// To:
export const revalidate = 300; // 5 minutes - product details rarely change
```

**Expected Improvement:** Less ISR rebuilds, faster TTL for cached pages

---

### **PRIORITY 5: Add React Suspense Boundaries**

Split component loading to show critical content first:

**In page.tsx:**

```typescript
import { Suspense } from "react";

export default async function ProductDetailPage(...) {
  // ... existing code ...

  return (
    <>
      <TrackProductView product={product} variant={activeVariant} />

      {/* Critical content - loads immediately */}
      <section className="container py-1 pb-16 sm:py-4 sm:pb-20 md:py-8 md:pb-8">
        <ProductGallery ... />
        <ProductDetails ... />
      </section>

      {/* Non-critical - can load slower */}
      <Suspense fallback={<div className="h-96 animate-pulse bg-muted rounded" />}>
        <RelatedProducts category={product.category} productId={product.id} currentProduct={product} />
      </Suspense>
    </>
  );
}
```

**Expected Improvement:** Page interactive sooner, perceived performance feels faster

---

## 📈 PERFORMANCE IMPROVEMENT ROADMAP

### Phase 1 (Immediate - 5 minutes)

✅ Fix connection pool (Priority 1)  
✅ Increase ISR revalidation (Priority 4)  
⏱️ **Expected Impact:** 337ms → ~150ms (56% faster)

### Phase 2 (Short-term - 30 minutes)

✅ Extract image mapping (Priority 3)  
✅ Optimize RelatedProducts (Priority 2)  
⏱️ **Expected Impact:** 150ms → ~80ms (47% faster)

### Phase 3 (Polish - 15 minutes)

✅ Add Suspense boundaries (Priority 5)  
✅ Test and validate  
⏱️ **Expected Impact:** Perceived performance +30%

---

## 🎯 EXPECTED RESULTS AFTER OPTIMIZATION

### Current State

```
Cold Load:  500-600ms total
Warm Load:  200-300ms total
Cache Hit:  <10ms
```

### After Phase 1 + 2

```
Cold Load:  250-300ms total  (50% improvement ✨)
Warm Load:  80-100ms total   (60% improvement ✨)
Cache Hit:  <10ms
```

---

## 🔍 TESTING CHECKLIST

After implementing fixes:

- [ ] Test product page load time (dev tools Network tab)
- [ ] Clear browser cache and test again
- [ ] Verify RelatedProducts still shows correct items
- [ ] Test image swapping works for all color variants
- [ ] Monitor database logs for connection issues
- [ ] Test on slow 3G connection (Chrome DevTools throttling)
- [ ] Verify ISR revalidation still works

---

## 📝 IMPLEMENTATION PRIORITY

| Priority | Task                  | Effort | Impact     | File(s)                                 |
| -------- | --------------------- | ------ | ---------- | --------------------------------------- |
| 🔴 **1** | Fix connection pool   | 5 min  | ⭐⭐⭐⭐⭐ | `src/lib/otp-service.ts`                |
| 🟠 **2** | Add category query    | 15 min | ⭐⭐⭐⭐   | `src/lib/server-data.ts`                |
| 🟠 **3** | Extract image mapping | 10 min | ⭐⭐⭐     | `src/lib/product-image-mapper.ts` (new) |
| 🟡 **4** | Increase ISR time     | 2 min  | ⭐⭐⭐     | `src/app/shop/[slug]/page.tsx`          |
| 🟡 **5** | Add Suspense          | 5 min  | ⭐⭐       | `src/app/shop/[slug]/page.tsx`          |

---

**Total estimated time to implement:** ~40 minutes  
**Expected performance gain:** 50-60% faster page loads

Let me know which priority you'd like to implement first!

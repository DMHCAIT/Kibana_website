# Kibana Web

A premium handbag e-commerce storefront, designed to match the Kibana mockup. Built on the team's standard stack.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** with the `kibana` brand palette
- **shadcn/ui**-style primitives (Button, Card, Badge, Input)
- **Lucide React** icons
- **Zustand** for the cart, **TanStack Query** for server state (ready to wire to tRPC + Supabase)
- **Zod** for schema validation
- **React Hook Form** for the newsletter / forms

The same components are designed to drop straight into a Turborepo monorepo alongside `apps/mobile` (Expo + NativeWind + React Native Reusables).

## Run locally

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3003. The fixed development port prevents a second
Kibana dev server from silently starting on another port and corrupting the same
Webpack cache. Run only one development server per checkout. Development uses
`.next`; local production builds and `next start` use `.next-build` so a build does
not overwrite the running development server's files. On Vercel (`VERCEL=1`),
builds and runtime use `.next`, which the Vercel Next.js deployment adapter expects.
Keep Vercel's Output Directory at the Next.js default (`.next`).

## Variant-only product editing and purchasing

The admin editor keeps only shared grouping information at product level. Add at
least one colour variant and edit its name, price, compare-at price, images,
description, features, specifications, shipping policy and stock inside that
colour. There are no separate parent image or page-content editors. Uploading
images changes the draft; click **Save Product** to publish.

Product Group has no separate page-slug field or URL preview. Edit public page
slugs within each colour variant. Existing group slugs are retained internally
for legacy links; new groups receive an automatic internal routing key so no
group slug needs to be entered when creating a product.

Existing inherited content is copied into each colour when opening the editor.
Legacy products without colours open as a single Default variant. Parent image,
price and content fields remain compatibility mirrors of the first colour, not
an additional purchasable product. Colour keys and IDs remain stable.

Each colour has its own listing and all sibling colours remain available on its
detail page. Only that colour's gallery is used. Cart, checkout (COD, UPI and card),
confirmation emails and orders use the selected colour's name, price, image and
identity. Orders retain the saved image even if the catalog changes afterward.
Unavailable selections must be removed rather than silently replaced by another
colour.

Run the variant regressions with:

```bash
node --test tests/admin-product.test.mjs tests/product-detail.test.mjs tests/product-card.test.mjs tests/variant-purchase.test.mjs
```

## Homepage section selection

In **Admin > Products > Edit > Colour Variants**, expand a colour and enable its
New, Most Trending or Best Seller tag (or inherit the group tag). Under
**Homepage section order**, give it a separate positive whole-number rank for
each section where it should appear, then click **Save Product**.

Each homepage section displays at most **four colour variants**, ordered by its
own rank (lowest first). Any positive rank is accepted; ranks need not be
consecutive. Equal ranks use product ID then colour key for stable ordering.
Leave a rank blank to exclude that colour from that homepage section. A rank
does not enable a disabled tag. You can tag unlimited variants; collection pages
such as New Arrivals still include all tagged variants, including unnumbered ones.
Selecting a homepage colour retains all sibling colours on its detail page.

**Shop by Category** has a separate rank in the same variant editor. It shows
the first four numbered colours within the active category tab, using the product
group's category. No New/Trending/Best Seller tag is required. Leave its rank
blank to exclude a colour from this homepage area; the full category page reached
by **View All** remains unchanged. This rank is saved as
`homepageRanks.shopByCategory` in the same variant JSONB data, without a new
database column or automatic assignment of positions.

Ranks are persisted inside each variant's `homepageRanks` object in the existing
`products.color_variants` JSONB database column. To initialize existing variants
without changing their tags, order or previously saved ranks, run:

```bash
npm run db:migrate-homepage-ranks
```

The migration is transactional and safe to rerun. It does **not** choose homepage
items automatically: sections remain empty until tagged variants are numbered.
Saving a product invalidates product caches and revalidates the homepage.

Run the homepage regressions with:

```bash
node --test tests/homepage-ranks.test.mjs tests/new-arrivals.test.mjs tests/most-trending.test.mjs tests/admin-product.test.mjs
```

## Windows image upload native dependency

Admin uploads and Next.js image optimization must resolve the same Sharp version.
The app uses Sharp 0.34.5 or compatible 0.34.x, externalized from the server bundle.
Mixing the older Sharp 0.32/libvips with Next's Sharp 0.34 in one Windows process
can cause GLib type errors or native DLL load failures.

After updating dependencies, fully stop and restart `npm run dev`; hot reload
cannot unload native libraries already loaded in the Node process. The first
development upload can also compile its route; that compilation time is separate
from native image processing failures.

Run the local native/upload regressions (no external storage writes) with:

```bash
node --test tests/upload-native.test.mjs
```

## Responsive interactions

Add-to-cart controls show a pending state immediately, block duplicate clicks
while saving, and report failures without claiming success. The cart count and
items still update optimistically; failed additions roll back. Product saves
and checkout submissions also prevent duplicate requests and keep their pending
feedback visible until the server confirms the operation. Payment callbacks show
order-saving feedback rather than encouraging a second payment.

Routes without their own loading screen use the shared page-loading boundary.
Button colour transitions use 100 ms rather than 300 ms. Concurrent browser
catalog loads share one request, including empty results; invalidation retains
visible products and prevents old requests from overwriting fresh cached data.
Product saves read only IDs, sort order and page slugs for uniqueness checks,
not every product's images, descriptions and full variants.

These changes target immediate feedback and avoidable work, not a guarantee of
instant database/network/payment completion. Test production builds rather than
development's first-request compilation when measuring navigation latency.

Run the interaction checks with:

```bash
node --test tests/product-cache.test.mjs tests/product-detail.test.mjs tests/admin-product.test.mjs tests/variant-purchase.test.mjs
```

## Product loading

Homepage collections stream in after the hero while catalog data loads. Database
queries retry temporary failures and only cache successful results; concurrent
catalog requests share one pending query. PostgreSQL cancels statements after
10 seconds (lock waits after 5 seconds), so retrying does not leave abandoned
queries occupying the connection pool. Connections time out after 8 seconds.
A slow query is not treated as an empty catalog. If loading ultimately fails, the error view
offers an in-page retry without a browser refresh.

The database pool is shared across hot reloads; health checks run on demand via
`/api/health`, not on timers that accumulate during development. An unauthenticated
`/api/auth/me` request returning 401 is expected for a signed-out visitor.

Run the product-loading regressions with:

```bash
node --test tests/product-loading.test.mjs
```

## Pages

The homepage hero shows only the first banner, using its desktop and mobile
images at the existing responsive breakpoints. It has no automatic rotation,
slide arrows, or pagination dots. Run its regression with
`node --test tests/hero-banner.test.mjs`.

Product cards use edge-to-edge images. Hover reveals another image from the
selected color's gallery (or the product gallery for products without colors);
cards without an alternate image keep their original image. The + quick-add
button adds one of that exact color to the cart without opening the product page.
The + uses a square white background with no hover color change; the wishlist
heart has no background. Both controls appear only on card hover or keyboard
focus at every screen size, including mobile.
Sold-out cards do not offer quick add; signed-out shoppers are prompted to log in.
Sold-out cards and product galleries show a small top-left Sold Out label without
dimming or blurring the product.

Images across the site use a shared Next.js image component with quality 95.
Responsive image widths extend to 3840px for full-width banners and high-density
displays while keeping smaller renditions for thumbnails. Upload high-resolution
originals: optimization cannot restore detail missing from a low-resolution or
already blurred source. Changes to image widths in Next.js config require a
development server restart.
Run the image-quality and gallery regressions with
`node --test tests/image-quality.test.mjs`.

Run the card regressions with `node --test tests/product-card.test.mjs`.

New Arrivals displays the first four catalog products marked `isNew`, using
their product data rather than a fixed selection or promotional images.
View All New Arrivals lists all products with that tag. If none are tagged,
the section shows an empty message instead of unrelated products.
Run its regressions with `node --test tests/new-arrivals.test.mjs`.

Category URLs are `/category/tote`, `/category/shoulder`, `/category/sling`,
`/category/duffle`, `/category/laptop`, `/category/backpack`, `/category/clutch`,
and `/category/wallet`. `/new-arrivals` dynamically lists all `isNew` products.
Navigation, category links and the sitemap use these paths; sorting stays on
the current collection route. Old single-category shop queries and the former
New Arrivals slug/title URL permanently redirect, preserving sorting and search.
Multi-category and other curated shop queries remain supported.
Collection toolbars use 12px product counts and a bordered Sort by trigger.
The closed trigger hides the current option; the accessible native dropdown
still selects Featured by default and preserves the selected sort.
Product status labels use compact 8px text/padding on mobile and 10px on wider
screens, including Sold Out labels in cards and product galleries.

Most Trending displays up to six catalog products marked `isTrending`, in catalog
order, using their product names, display images (or normal product images) and
product links. No fixed selections or promotional image overrides are used.
An empty tagged selection shows an empty message with no carousel controls.
Run its regressions with `node --test tests/most-trending.test.mjs`.

- `/` — Home (matches the Kibana mockup: hero, new arrivals, best sellers, categories, price, trending, style, trust badges, review, newsletter, footer)
- `/shop` — Product listing with filterable category pills
- `/shop/[slug]` — Product detail page

Shop All, search results, and category collections share a centered title and
sort/count toolbar. Collection image-size controls switch between one/two
columns on mobile and two/three/four on desktop (default: two on mobile, four
on desktop). Collection images fill a uniform 4:5 frame with cover-fit, without
stretching, inset padding, or background side bands. Featured ordering mixes
styles by showing one colour from each product before the next colour round,
keeping all variants and a consistent order across reloads. Price and Newest
sorts retain their requested ordering. Existing
category, product-slug, search and title query parameters survive sorting.
The Newest option places New-tagged products first; the catalog has no creation
timestamp, so it does not invent a chronological order within those groups.

Public storefront typography follows the Zamana reference: Jost 400 uppercase
headings with 0.18em tracking, Montserrat 400 body copy at 14px/1.65, product
titles at 12px/1.7, and text buttons at 13px with 0.2em tracking. Shared spacing
uses 20px mobile / 48px desktop gutters, 40px / 64px section padding, and
36px / 48px section-heading gaps, with intermediate tablet values.
These tokens are scoped by `StorefrontShell` to public routes, including the
header, footer, informational pages, cart, checkout, account and orders.
Admin routes retain their existing styling. Kibana content, branding, colours,
catalog ordering, authentication and purchase behaviour are preserved.
Run the scope regressions with `node --test tests/storefront-style.test.mjs`.
Shop by Category labels use Montserrat 400 at 12px, with 0.2em letter spacing
and compact rounded selection pills, while retaining 44px touch targets.
The desktop Shop All dropdown opens on hover or keyboard focus and closes on
link selection (including same-page category changes), outside clicks, Escape,
or leaving the menu. Keyboard focus styling is retained.

Product detail pages share a responsive layout: a full-width first gallery image
and two-column image grid on desktop, a swipeable gallery with pagination on
mobile with pagination dots on a white strip below the image, and a
keyboard-accessible full-screen image viewer. The details column
uses image color swatches, rounded quantity/cart controls, expandable product
information, the existing delivery check, review totals, and related products.
Variant titles, images, descriptions, features, specifications, stock and cart
selection still come from the existing catalog. Kibana policies, prices, header/footer
content and checkout behaviour are unchanged; no reference-site discounts, warranty claims,
delivery upgrades or packaging charges are added.
The Related Products carousel below the details shows four large cards across
on desktop, two on tablets, and swipeable cards on mobile. Arrow controls move
one card at a time and update when the carousel is resized.
On mobile, related-product arrows appear only on carousel hover or keyboard
focus; swipe navigation remains available while arrows are hidden.
On mobile, purchase controls use two rows: quantity above the cart button and
wishlist heart. At wider screen sizes, they remain in a single row.

Run the product-page regressions with
`node --test tests/product-detail.test.mjs tests/image-quality.test.mjs`.

Product pages do not show a product-sharing section. Delivery labels and valid
pincode-check results state "Delivery within 4 days."
The delivery estimate above the color selection instead displays "Est Delivery
by:" with a bold weekday and date four calendar days from today in India
(`Asia/Kolkata`). It calculates in the browser independently of the product-page
cache and refreshes once a minute for pages left open across midnight.
Run its date regressions with `node --test tests/estimated-delivery.test.mjs`.

## Project layout

```
src/
├── app/                 # Next.js App Router pages
├── components/
│   ├── ui/              # shadcn-style primitives
│   ├── layout/          # header, footer, mobile bottom nav
│   ├── home/            # home page sections
│   └── product/         # product card / detail
├── lib/                 # data + helpers
├── store/               # zustand stores
└── types/               # shared zod schemas + types
```

## Responsive design

The mockup is mobile-first. The layout reads as a single column at narrow widths (mirroring the PDF) and progressively expands to 2- and 4-column grids on `md` and `lg` breakpoints for desktop.

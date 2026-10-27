import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import presentation from "./helpers/product-presentation.mjs";

const jsx = (type, props) => ({ type, props });
function load(file, imports) {
  const { outputText } = ts.transpileModule(
    readFileSync(new URL(`../${file}`, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
      },
    },
  );
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    URLSearchParams,
    require(name) {
      if (name === "@/lib/product-presentation") return presentation;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      assert.ok(Object.hasOwn(imports, name), `Unexpected import: ${name}`);
      return imports[name];
    },
  });
  return exports;
}
function nodes(tree) {
  const result = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    result.push(node);
    for (const child of [node.props?.children].flat(Infinity)) visit(child);
  }
  visit(tree);
  return result;
}
const cn = (...values) => values.filter(Boolean).join(" ");

test("collection density controls select shared responsive grid layouts without altering items", () => {
  let density;
  const { CollectionView } = load("src/components/shop/collection-view.tsx", {
    react: {
      useState: (initial) => [
        density ?? initial,
        (value) => {
          density = value;
        },
      ],
    },
    "@/components/product/product-grid": { ProductGrid: "grid" },
    "./shop-header": { ShopHeader: "header" },
    "@/lib/utils": { cn },
  });
  const items = [{ key: "blue", product: { id: "bag" } }];
  function render() {
    return nodes(CollectionView({ items, heading: "Tote Bags", sort: "price-asc" }));
  }
  let elements = render();
  const header = elements.find((node) => node.type === "header");
  assert.equal(header.props.heading, "Tote Bags");
  assert.equal(header.props.count, 1);
  assert.equal(header.props.sort, "price-asc");
  const groups = nodes(header.props.layoutControls).filter((node) => node.props?.role === "group");
  const mobileControls = nodes(groups[0]).filter((node) => node.type === "button");
  assert.equal(mobileControls.length, 2);
  assert.equal(mobileControls[1].props["aria-pressed"], true);
  const controls = nodes(groups[1]).filter((node) => node.type === "button");
  assert.equal(controls[2].props["aria-pressed"], true);
  assert.equal(elements.find((node) => node.type === "grid").props.columns, "collection-compact");
  controls[1].props.onClick();
  assert.equal(render().find((node) => node.type === "grid").props.columns, "collection-standard");
  controls[0].props.onClick();
  elements = render();
  assert.equal(elements.find((node) => node.type === "grid").props.columns, "collection-large");
  controls[2].props.onClick();
  assert.equal(render().find((node) => node.type === "grid").props.columns, "collection-compact");
  assert.equal(render().find((node) => node.type === "grid").props.items, items);
  assert.equal(
    nodes(CollectionView({ items: [], heading: "Empty", sort: "featured" })).filter(
      (node) => node.type === "grid",
    ).length,
    0,
  );
});

test("collection grid supports the reference column counts at mobile and desktop sizes", () => {
  const { ProductGrid } = load("src/components/product/product-grid.tsx", {
    "./product-card": { ProductCard: "card" },
    "@/lib/utils": { cn },
  });
  for (const [size, mobile, desktop] of [
    ["large", 1, 2],
    ["standard", 2, 3],
    ["compact", 2, 4],
  ]) {
    const tree = ProductGrid({ columns: `collection-${size}`, products: [] });
    assert.ok(tree.props.className.includes(`grid-cols-${mobile} lg:grid-cols-${desktop}`));
  }
});

test("sorting preserves active collection, search and curated product parameters", () => {
  const pushed = [];
  const params = "cat=tote-bag&q=blue&slugs=bag-one,bag-two&title=New+Arrivals";
  const { SortSelect } = load("src/app/shop/sort-select.tsx", {
    "next/navigation": {
      useRouter: () => ({ push: (url) => pushed.push(url) }),
      usePathname: () => "/shop",
      useSearchParams: () => new URLSearchParams(params),
    },
  });
  const select = nodes(SortSelect({ current: "featured" })).find((node) => node.type === "select");
  assert.equal(select.props["aria-label"], "Sort products");
  assert.equal(select.props.value, "featured");
  assert.match(select.props.className, /opacity-0/);
  const trigger = SortSelect({ current: "featured" });
  assert.match(trigger.props.className, /text-\[12px\]/);
  assert.equal(nodes(trigger).find((node) => node.type === "span").props.children, "Sort by");
  select.props.onChange({ target: { value: "price-desc" } });
  const result = new URL(pushed[0], "http://localhost");
  assert.equal(result.searchParams.get("cat"), "tote-bag");
  assert.equal(result.searchParams.get("q"), "blue");
  assert.equal(result.searchParams.get("slugs"), "bag-one,bag-two");
  assert.equal(result.searchParams.get("title"), "New Arrivals");
  assert.equal(result.searchParams.get("sort"), "price-desc");
});

test("Shop All and individual categories retain catalog data, filters, variant links and sorting", async () => {
  const products = [
    {
      id: "p1",
      slug: "tote-one",
      name: "Tote One",
      category: "tote-bag",
      description: "blue",
      price: 3000,
      colorVariants: [
        {
          slug: "blue",
          color: "Blue",
          productTitle: "Blue Tote",
          image: "/blue.webp",
          inStock: false,
        },
      ],
    },
    {
      id: "p2",
      slug: "sling",
      name: "Sling",
      category: "sling-bag",
      description: "green",
      price: 2000,
      colorVariants: [],
    },
    {
      id: "p3",
      slug: "tote-two",
      name: "Tote Two",
      category: "tote-bag",
      description: "tan",
      price: 1000,
      colorVariants: [],
      isNew: true,
    },
  ];
  const { default: ShopPage } = load("src/components/shop/shop-listing.tsx", {
    "@/lib/server-data": {
      getProducts: async () => products,
      getCategories: async () => [{ slug: "tote-bag", name: "Tote Bags" }],
    },
    "@/components/shop/collection-view": { CollectionView: "collection" },
    "@/lib/product-images": { getShopDisplayImage: (_p, variant) => variant.image },
    "@/components/analytics/track-product-listing-view": { TrackProductListingView: "tracking" },
    "@/components/analytics/track-search": { TrackSearch: "search-tracking" },
  });
  async function render(params) {
    return nodes(await ShopPage({ searchParams: Promise.resolve(params) })).find(
      (node) => node.type === "collection",
    ).props;
  }
  assert.equal((await render({})).heading, "Shop All");
  assert.equal((await render({})).items.length, 3);
  const totes = await render({ cat: "tote-bag", sort: "price-asc" });
  assert.equal(totes.heading, "Tote Bags");
  assert.deepEqual(totes.items.map((item) => item.product.id).join(","), "p3,p1");
  assert.equal(totes.items[1].href, "/shop/tote-one?color=blue");
  assert.equal(totes.items[1].displayImage, "/blue.webp");
  assert.equal(totes.items[1].variantInStock, false);
  assert.equal((await render({ category: "sling-bag" })).items[0].product, products[1]);
  assert.equal((await render({ q: "blue" })).items.length, 1);
  assert.equal(
    (await render({ slugs: "tote-two", title: "New Arrivals" })).heading,
    "New Arrivals",
  );
  assert.equal((await render({ sort: "newest" })).items[0].product, products[2]);
  assert.equal((await render({ cat: "wallet" })).items.length, 0);
  const newArrivals = nodes(
    await ShopPage({ searchParams: Promise.resolve({ sort: "price-asc" }), newArrivals: true }),
  ).find((node) => node.type === "collection").props;
  assert.equal(newArrivals.heading, "New Arrivals");
  assert.equal(newArrivals.items.length, 1);
  assert.equal(newArrivals.items[0].product, products[2]);
  const category = nodes(
    await ShopPage({ searchParams: Promise.resolve({ cat: "sling-bag" }), category: "tote-bag" }),
  ).find((node) => node.type === "collection").props;
  assert.equal(category.items.length, 2);
  assert.ok(category.items.every((item) => item.product.category === "tote-bag"));
});

test("clean category routes cover all eight categories and reject unknown paths", async () => {
  const { SHOP_CATEGORIES } = load("src/lib/shop-categories.ts", {});
  const { default: CategoryPage, generateMetadata } = load("src/app/category/[slug]/page.tsx", {
    "next/navigation": {
      notFound() {
        throw new Error("404");
      },
    },
    "@/components/shop/shop-listing": { default: "listing" },
    "@/lib/shop-categories": { SHOP_CATEGORIES },
  });
  assert.equal(
    SHOP_CATEGORIES.map((category) => category.href).join(","),
    "/category/tote,/category/shoulder,/category/sling,/category/duffle,/category/laptop,/category/backpack,/category/clutch,/category/wallet",
  );
  for (const category of SHOP_CATEGORIES) {
    const props = {
      params: Promise.resolve({ slug: category.href.split("/").pop() }),
      searchParams: Promise.resolve({ sort: "price-desc" }),
    };
    const page = await CategoryPage(props);
    assert.equal(page.props.category, category.slug);
    assert.equal(page.props.searchParams, props.searchParams);
    assert.equal((await generateMetadata(props)).alternates.canonical, category.href);
  }
  await assert.rejects(
    CategoryPage({
      params: Promise.resolve({ slug: "missing" }),
      searchParams: Promise.resolve({}),
    }),
    /404/,
  );
});

test("legacy collection URLs redirect without dropping sort or search parameters", async () => {
  const { SHOP_CATEGORIES } = load("src/lib/shop-categories.ts", {});
  const { default: ShopPage } = load("src/app/shop/page.tsx", {
    "next/navigation": {
      permanentRedirect(url) {
        throw new Error(url);
      },
    },
    "@/components/shop/shop-listing": { default: "listing" },
    "@/lib/shop-categories": { SHOP_CATEGORIES },
  });
  for (const category of SHOP_CATEGORIES) {
    for (const key of ["cat", "category"]) {
      await assert.rejects(
        ShopPage({
          searchParams: Promise.resolve({ [key]: category.slug, sort: "price-asc", q: "blue" }),
        }),
        (error) => error.message === `${category.href}?sort=price-asc&q=blue`,
      );
    }
  }
  await assert.rejects(
    ShopPage({
      searchParams: Promise.resolve({
        slugs: "old-product",
        title: "New Arrivals",
        sort: "newest",
      }),
    }),
    (error) => error.message === "/new-arrivals?sort=newest",
  );
  assert.equal(
    (await ShopPage({ searchParams: Promise.resolve({ cat: "tote-bag,sling-bag" }) })).type,
    "listing",
  );
  assert.equal((await ShopPage({ searchParams: Promise.resolve({}) })).type, "listing");
});

test("sorting stays on clean collection routes and removes empty query strings", () => {
  for (const pathname of ["/category/tote", "/new-arrivals"]) {
    const pushed = [];
    const { SortSelect } = load("src/app/shop/sort-select.tsx", {
      "next/navigation": {
        useRouter: () => ({ push: (url) => pushed.push(url) }),
        usePathname: () => pathname,
        useSearchParams: () => new URLSearchParams("sort=newest"),
      },
    });
    const select = nodes(SortSelect({ current: "newest" })).find((node) => node.type === "select");
    select.props.onChange({ target: { value: "price-desc" } });
    assert.equal(pushed[0], `${pathname}?sort=price-desc`);
    select.props.onChange({ target: { value: "featured" } });
    assert.equal(pushed[1], pathname);
  }
});

test("featured collections interleave styles deterministically without losing variants or changing explicit sorts", async () => {
  const products = [
    { id: "a", price: 3000, colors: ["blue", "green", "tan"] },
    { id: "b", price: 1000, colors: ["black", "wine"] },
    { id: "c", price: 2000, colors: [] },
    { id: "d", price: 4000, colors: ["cream", "pink"], isNew: true },
  ].map(({ colors, ...product }) => ({
    ...product,
    slug: product.id,
    name: product.id,
    category: "tote-bag",
    description: "bag",
    colorVariants: colors.map((slug) => ({ slug, color: slug, image: `/${slug}.webp` })),
  }));
  const { default: ShopPage } = load("src/components/shop/shop-listing.tsx", {
    "@/lib/server-data": {
      getProducts: async () => products,
      getCategories: async () => [{ slug: "tote-bag", name: "Tote Bags" }],
    },
    "@/components/shop/collection-view": { CollectionView: "collection" },
    "@/lib/product-images": { getShopDisplayImage: (_p, variant) => variant.image },
    "@/components/analytics/track-product-listing-view": { TrackProductListingView: "tracking" },
    "@/components/analytics/track-search": { TrackSearch: "search-tracking" },
  });
  async function items(params = {}) {
    return nodes(await ShopPage({ searchParams: Promise.resolve(params) })).find(
      (node) => node.type === "collection",
    ).props.items;
  }
  const expected = "a-blue,b-black,c,d-cream,a-green,b-wine,d-pink,a-tan";
  for (const params of [{}, { cat: "tote-bag" }, { q: "bag" }, { slugs: "a,b,c,d" }]) {
    const result = await items(params);
    assert.equal(result.map((item) => item.key).join(","), expected);
    assert.equal(new Set(result.map((item) => item.key)).size, 8);
    assert.equal(new Set(result.slice(0, 4).map((item) => item.product.id)).size, 4);
  }
  assert.equal((await items()).map((item) => item.key).join(","), expected);
  assert.equal(
    (await items({ slugs: "a" })).map((item) => item.key).join(","),
    "a-blue,a-green,a-tan",
  );
  assert.equal((await items({ cat: "missing" })).length, 0);
  for (const sort of ["price-asc", "price-desc"]) {
    const prices = (await items({ sort })).map((item) => item.product.price);
    assert.equal(
      prices.join(","),
      [...prices].sort((a, b) => (sort === "price-asc" ? a - b : b - a)).join(","),
    );
  }
  assert.equal((await items({ sort: "newest" }))[0].product.id, "d");
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import presentation from "./helpers/product-presentation.mjs";

const jsx = (type, props) => ({ type, props });
const icons = Object.fromEntries(
  [
    "Calendar",
    "Check",
    "ChevronDown",
    "FileText",
    "RotateCcw",
    "Star",
    "Truck",
    "ChevronLeft",
    "ChevronRight",
    "X",
    "ZoomIn",
    "ShoppingBag",
    "Minus",
    "Plus",
    "Heart",
    "ArrowRight",
  ].map((name) => [name, name]),
);

function loadModule(file, imports, globals = {}) {
  const { outputText } = ts.transpileModule(
    readFileSync(new URL(`../src/app/shop/[slug]/${file}`, import.meta.url), "utf8"),
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
    console: { log() {} },
    require(name) {
      if (name === "@/lib/product-presentation") return presentation;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "lucide-react") return icons;
      assert.ok(Object.hasOwn(imports, name), `Unexpected import: ${name}`);
      return imports[name];
    },
    ...globals,
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

function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  if (node && typeof node === "object") return text(node.props?.children);
  return node === null || node === undefined || node === false ? "" : String(node);
}

const product = {
  id: "bag",
  slug: "bag",
  name: "Original name",
  price: 2499,
  compareAtPrice: 4999,
  rating: 4.5,
  reviewCount: 12,
  image: "/bag.webp",
  gallery: ["/bag-detail.webp"],
  category: "handbag",
  colors: ["Blue", "Mocha"],
  description: "Original description",
  features: ["Original feature"],
  specs: { Width: "20cm" },
  colorVariants: [
    { slug: "blue", color: "Blue", image: "/blue.webp", inStock: true },
    {
      slug: "mocha",
      color: "Mocha",
      image: "/mocha.webp",
      gallery: ["/mocha-detail.webp"],
      productTitle: "Mocha title",
      description: "Mocha description",
      features: ["Mocha feature"],
      specs: { Width: "25cm" },
      inStock: false,
    },
  ],
};

function pageModule(catalogProduct = product) {
  return loadModule("page.tsx", {
    "next/navigation": {
      notFound() {
        throw new Error("Not found");
      },
    },
    "next/link": { default: "link" },
    react: { Suspense: "suspense" },
    "@/components/ui/image": { default: "image" },
    "@/lib/server-data": { getProductBySlug: async () => catalogProduct },
    "@/lib/utils": {
      discountPct: () => 50,
      formatINR: (value) => `INR ${value}`,
      cn: (...values) => values.filter(Boolean).join(" "),
    },
    "@/lib/product-images": {
      getShopDisplayImage: (_product, variant) => variant.image,
      pickDefaultProductImage: (image) => image,
    },
    "@/components/product/product-carousel": { ProductCarousel: "carousel" },
    "./add-to-cart": { AddToCartButton: "purchase" },
    "./product-gallery": { ProductGallery: "gallery" },
    "./delivery-check": { DeliveryCheck: "delivery" },
    "./estimated-delivery": { EstimatedDelivery: "estimated-delivery" },
    "@/components/analytics/track-product-view": { TrackProductView: "tracking" },
  });
}

const routeProps = (color) => ({
  params: Promise.resolve({ slug: "bag" }),
  searchParams: Promise.resolve({ color }),
});

test("redesigned template preserves selected color content, prices, stock, analytics and purchase data", async () => {
  const before = JSON.stringify(product);
  const tree = await pageModule().default(routeProps("mocha"));
  const elements = nodes(tree);
  assert.equal(text(elements.find((node) => node.type === "h1")), "Mocha title");
  for (const value of [
    "Mocha description",
    "Mocha feature",
    "25cm",
    "INR 2499",
    "INR 4999",
    "4.5",
    "12 reviews",
    "Free shipping on all orders above ₹999",
    "Easy returns within 7 days of delivery",
    "Products must be unused and in original packaging",
  ])
    assert.ok(text(tree).includes(value), value);
  const gallery = elements.find((node) => node.type === "gallery");
  assert.equal(gallery.props.variantInStock, false);
  assert.deepEqual(Array.from(gallery.props.images), ["/mocha.webp", "/mocha-detail.webp"]);
  const purchase = elements.find((node) => node.type === "purchase");
  assert.equal(purchase.props.product, product);
  assert.equal(purchase.props.activeVariantSlug, "mocha");
  assert.equal(
    elements.find((node) => node.type === "tracking").props.variant,
    product.colorVariants[1],
  );
  assert.ok(elements.some((node) => node.type === "delivery"));
  assert.ok(!elements.some((node) => node.type === "share"));
  assert.doesNotMatch(text(tree), /Share Product|Share on WhatsApp|5-7 Days Delivery/);
  assert.equal(text(tree).split("Delivery within 4 days").length - 1, 1);
  assert.ok(elements.some((node) => node.type === "estimated-delivery"));
  assert.equal(JSON.stringify(product), before);
  assert.doesNotMatch(text(tree), /Zamana|Express|Packaging|Warranty|BUY ANY/);
});

test("color image links and expandable sections are accessible and default color uses original fallbacks", async () => {
  const elements = nodes(await pageModule().default(routeProps("invalid")));
  assert.equal(text(elements.find((node) => node.type === "h1")), product.name);
  assert.equal(elements.find((node) => node.type === "purchase").props.activeVariantSlug, "blue");
  const swatches = elements.filter((node) => node.props?.["aria-label"]?.startsWith("Select "));
  assert.equal(swatches.length, 2);
  assert.equal(swatches[0].props["aria-current"], "true");
  assert.equal(swatches[1].props.href, "/shop/bag?color=mocha");
  assert.equal(elements.filter((node) => node.type === "details").length, 3);
  assert.ok(elements.some((node) => node.props?.id === "product-reviews"));
});

test("selected colour keeps its own price, empty details and gallery without parent image leakage", async () => {
  const custom = structuredClone(product);
  Object.assign(custom.colorVariants[1], {
    price: 3199, compareAtPrice: 5999, description: "", features: [], specs: {}, gallery: [],
    pageSlug: "mocha-bag",
  });
  const tree = await pageModule(custom).default({
    params: Promise.resolve({ slug: "mocha-bag" }),
    searchParams: Promise.resolve({ color: "blue" }),
  });
  const elements = nodes(tree);
  assert.equal(text(elements.find((node) => node.type === "h1")), "Mocha title");
  assert.deepEqual(Array.from(elements.find((node) => node.type === "gallery").props.images), ["/mocha.webp"]);
  assert.ok(text(tree).includes("INR 3199"));
  assert.ok(text(tree).includes("INR 5999"));
  assert.ok(!text(tree).includes("Original description"));
  assert.ok(!text(tree).includes("Original feature"));
  const swatches = elements.filter((node) => node.props?.["aria-label"]?.startsWith("Select "));
  assert.equal(swatches.length, 2);
  assert.equal(swatches[0].props.href, "/shop/bag?color=blue");
  assert.equal(swatches[1].props["aria-current"], "true");
});

test("products without colors retain product data and missing products retain not-found behavior", async () => {
  const simple = { ...product, colorVariants: [], colors: [] };
  const elements = nodes(await pageModule(simple).default(routeProps()));
  assert.equal(
    elements.find((node) => node.type === "purchase").props.activeVariantSlug,
    undefined,
  );
  assert.deepEqual(Array.from(elements.find((node) => node.type === "gallery").props.images), [
    "/bag.webp",
    "/bag-detail.webp",
  ]);
  await assert.rejects(pageModule(null).default(routeProps()), /Not found/);
  const metadata = await pageModule().generateMetadata(routeProps());
  assert.equal(metadata.alternates.canonical, "/shop/bag");
  assert.equal(metadata.description, product.description);
});

function hookState() {
  const state = [];
  let index = 0;
  return {
    reset() {
      index = 0;
    },
    react: {
      useState(initial) {
        const key = index++;
        if (!(key in state)) state[key] = initial;
        return [
          state[key],
          (value) => {
            state[key] = typeof value === "function" ? value(state[key]) : value;
          },
        ];
      },
      useRef(initial) {
        const key = index++;
        if (!(key in state)) state[key] = { current: initial };
        return state[key];
      },
      useEffect() {},
    },
  };
}

test("gallery opens the chosen image, wraps keyboard navigation and closes without changing sources", () => {
  const hooks = hookState();
  const { ProductGallery } = loadModule("product-gallery.tsx", {
    react: hooks.react,
    "@/components/ui/image": { default: "image" },
    "@/components/ui/badge": { Badge: "badge" },
  });
  const props = { images: ["/one.webp", "/two.webp"], productName: "Bag", discountPct: 50 };
  function render() {
    hooks.reset();
    return nodes(ProductGallery(props));
  }
  let elements = render();
  const pagination = elements.find((node) => node.props?.["aria-label"] === "Gallery pagination");
  assert.ok(pagination);
  assert.match(pagination.props.className, /bg-white/);
  assert.doesNotMatch(pagination.props.className, /absolute|bottom-/);
  assert.equal(nodes(pagination).filter((node) => node.type === "button").length, 2);
  elements.find((node) => node.props?.["aria-label"] === "Zoom Bag image 2").props.onClick();
  elements = render();
  let dialog = elements.find((node) => node.type === "dialog");
  assert.ok(!nodes(dialog).some((node) => node.type === "p" && text(node) === "Bag"));
  assert.equal(dialog.props["aria-label"], "Bag image viewer");
  assert.equal(nodes(dialog).find((node) => node.type === "image").props.src, "/two.webp");
  dialog.props.onKeyDown({ key: "ArrowRight" });
  elements = render();
  dialog = elements.find((node) => node.type === "dialog");
  assert.equal(nodes(dialog).find((node) => node.type === "image").props.src, "/one.webp");
  elements.find((node) => node.props?.["aria-label"] === "Close image viewer").props.onClick();
  assert.equal(
    nodes(render().find((node) => node.type === "dialog")).filter((node) => node.type === "image")
      .length,
    0,
  );
  render()
    .find((node) => node.props?.["aria-label"] === "Zoom Bag image 1")
    .props.onClick();
  let prevented = false;
  render()
    .find((node) => node.type === "dialog")
    .props.onKeyDown({
      key: "Escape",
      preventDefault() {
        prevented = true;
      },
    });
  assert.equal(prevented, true);
  assert.equal(
    nodes(render().find((node) => node.type === "dialog")).filter((node) => node.type === "image")
      .length,
    0,
  );
});

test("purchase controls retain quantity, exact color, authentication, wishlist and sold-out behavior", async () => {
  const hooks = hookState();
  const additions = [];
  const wishlist = [];
  const prompts = [];
  let resolveAddition;
  let holdAddition = false;
  let user = { id: "customer", email: "customer@example.test" };
  const { AddToCartButton } = loadModule(
    "add-to-cart.tsx",
    {
      react: hooks.react,
      "@/components/ui/image": { default: "image" },
      "next/link": { default: "link" },
      "@/components/ui/button": { Button: "button" },
      "@/store/cart-store": {
        useCart: (selector) => selector({ add: (...args) => {
          additions.push(args);
          if (holdAddition) return new Promise((resolve) => { resolveAddition = resolve; });
        } }),
      },
      "@/store/auth-store": {
        useAuth: () => ({ user, openAuthModal: (message) => prompts.push(message) }),
      },
      "@/store/wishlist-store": {
        useWishlist: () => ({ has: () => false, add: (key) => wishlist.push(key), remove() {} }),
      },
      "@/lib/utils": {
        cn: (...values) => values.filter(Boolean).join(" "),
        formatINR: String,
        getProductDisplayName: () => product.name,
      },
      "@/lib/analytics": { trackAddToCart() {} },
    },
    { window: { location: { search: "?color=blue" } }, URLSearchParams, setTimeout() {} },
  );
  function render(slug = "blue") {
    hooks.reset();
    return nodes(AddToCartButton({ product, activeVariantSlug: slug }));
  }
  const button = (elements, label) => elements.find((node) => node.props?.["aria-label"] === label);
  let elements = render();
  const quantity = elements.find((node) => node.props?.["aria-label"] === "Quantity");
  assert.match(quantity.props.className, /col-span-2/);
  assert.ok(
    elements.some(
      (node) =>
        /grid-cols-\[minmax\(0,1fr\)_auto\]/.test(node.props?.className ?? "") &&
        /sm:flex/.test(node.props.className),
    ),
  );
  button(elements, "Decrease quantity").props.onClick();
  button(render(), "Increase quantity").props.onClick();
  elements = render();
  await elements
    .find((node) => node.type === "button" && text(node).includes("Add to Cart"))
    .props.onClick();
  assert.deepEqual(additions, [[product, 2, "blue"]]);
  const wishlistButton = button(elements, "Save to wishlist");
  assert.match(wishlistButton.props.className, /(?:^|\s)w-12(?:\s|$)/);
  assert.equal(wishlistButton.props.size, "icon");
  assert.equal(wishlistButton.props.variant, "ghost");
  assert.match(wishlistButton.props.className, /(?:^|\s)border-0(?:\s|$)/);
  assert.match(wishlistButton.props.className, /(?:^|\s)bg-transparent(?:\s|$)/);
  assert.match(wishlistButton.props.className, /(?:^|\s)hover:bg-transparent(?:\s|$)/);
  assert.equal(wishlistButton.props["aria-pressed"], false);
  const wishlistHeart = nodes(wishlistButton).find((node) => node.type === "Heart");
  assert.ok(wishlistHeart);
  assert.match(wishlistHeart.props.className, /(?:^|\s)h-6 w-6(?:\s|$)/);
  assert.match(wishlistHeart.props.className, /(?:^|\s)text-foreground\/70(?:\s|$)/);
  assert.equal(wishlistHeart.props.strokeWidth, 1.5);
  wishlistButton.props.onClick();
  assert.deepEqual(wishlist, ["bag-blue"]);
  user = null;
  elements = render();
  await elements
    .find((node) => node.type === "button" && text(node).includes("Add to Cart"))
    .props.onClick();
  assert.equal(additions.length, 1);
  assert.deepEqual(prompts, ["Please log in to add items to your cart."]);
  const soldOut = render("mocha");
  assert.ok(soldOut.find((node) => node.type === "button" && node.props.disabled));
  assert.equal(button(soldOut, "Increase quantity"), undefined);
  user = { id: "customer", email: "customer@example.test" };
  holdAddition = true;
  const addButton = render().find((node) => node.type === "button" && text(node).includes("Add to Cart"));
  const start = performance.now();
  const pending = addButton.props.onClick();
  assert.ok(performance.now() - start < 100, "Feedback must not wait for the server");
  await addButton.props.onClick();
  assert.equal(additions.length, 2, "Repeated clicks must not create duplicate additions while pending");
  const waiting = render().find((node) => node.type === "button" && text(node).includes("Adding..."));
  assert.equal(waiting.props.disabled, true);
  assert.equal(waiting.props["aria-busy"], true);
  resolveAddition();
  await pending;
  assert.ok(render().some((node) => node.type === "button" && text(node).includes("Add to Cart") && !node.props.disabled));
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { z } from "zod";
import presentation from "./helpers/product-presentation.mjs";

function load(file, imports = {}, globals = {}) {
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const { outputText } = ts.transpileModule(
    readFileSync(new URL(`../${file}`, import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } },
  );
  vm.runInNewContext(outputText, {
    exports, console,
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "@/lib/product-presentation") return presentation;
      assert.ok(Object.hasOwn(imports, name), name);
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
const types = load("src/types/product.ts", { zod: { z } });
const categories = load("src/lib/shop-categories.ts");
const admin = load("src/lib/admin-product.ts", {
  zod: { z },
  "@/types/product": types,
  "@/lib/shop-categories": categories,
});
const product = admin.initializeProductVariants(types.ProductSchema.parse({
  id: "test-bag", slug: "test-bag", name: "Test Bag", description: "Description",
  price: 2000, image: "/first.webp", gallery: ["/first.webp", "/second.webp", "/third.webp"],
  category: "shoulder-bag", gender: "women", isNew: true,
  shippingReturns: "Shipping text\nReturns text",
  features: ["Zip closure"], specs: { Material: "Vegan leather" },
  colorVariants: [
    { variantId: "blue-id", slug: "blue", pageSlug: "test-bag-blue", color: "Blue", image: "/blue.webp", gallery: ["/blue.webp", "/blue-hover.webp"], inStock: false, isNew: false, isTrending: true, description: "Blue description", shippingReturns: "Blue policy" },
    { variantId: "tan-id", slug: "tan", pageSlug: "test-bag-tan", color: "Tan", image: "/tan.webp", inStock: true },
  ],
}));

test("editor schema preserves all content, stock, variant URLs and tag overrides", () => {
  const result = admin.AdminProductSchema.parse(product);
  assert.equal(result.shippingReturns, product.shippingReturns);
  assert.equal(result.colorVariants[0].isNew, false);
  assert.equal(result.colorVariants[0].pageSlug, "test-bag-blue");
  assert.equal(result.colorVariants[0].inStock, false);
  assert.equal(result.colorVariants[0].shippingReturns, "Blue policy");
  for (const category of categories.SHOP_CATEGORIES) {
    assert.equal(admin.AdminProductSchema.safeParse({ ...product, category: category.slug }).success, true);
  }
  assert.equal(admin.AdminProductSchema.safeParse({ ...product, category: "handbag" }).success, false);
  assert.equal(admin.AdminProductSchema.safeParse({ ...product, price: 0 }).success, false);
  assert.equal(admin.AdminProductSchema.safeParse({ ...product, slug: "Invalid Slug" }).success, false);
  const duplicate = structuredClone(product);
  duplicate.colorVariants[1].pageSlug = duplicate.colorVariants[0].pageSlug;
  assert.equal(admin.AdminProductSchema.safeParse(duplicate).success, false);
  assert.throws(() => admin.assertUniqueProductSlugs(product, [{ ...product, id: "another" }]), /already used/);
  admin.assertUniqueProductSlugs(product, [product]);
});

test("ordered images use first as main/colour and second as hover without filename or marketing overrides", () => {
  const normalized = admin.normalizeProductImages({ ...product, displayImage: "/old.webp", gallery: ["/second.webp", "/first.webp", "/third.webp"] });
  assert.equal(normalized.image, "/blue.webp");
  assert.equal(normalized.gallery.join(","), "/blue.webp,/blue-hover.webp");
  assert.equal(normalized.displayImage, undefined);
  const imageHelpers = load("src/lib/product-images.ts");
  assert.equal(imageHelpers.pickDefaultProductImage("/first.webp", ["/Image06.webp"]), "/first.webp");
  assert.equal(imageHelpers.getShopDisplayImage({ ...product, slug: "prizma-sling-bag" }, product.colorVariants[0]), "/blue.webp");
  assert.equal(presentation.productHref(product, product.colorVariants[0]), "/shop/test-bag-blue");
  assert.equal(presentation.productInStock(product, product.colorVariants[0]), false);
  assert.equal(presentation.productInStock({ ...product, inStock: false }, product.colorVariants[1]), false);
});

test("variant tag overrides control tagged collections without promoting untagged colours", () => {
  const fresh = presentation.taggedProducts([product], "isNew");
  assert.equal(fresh.length, 1);
  assert.equal(fresh[0].colorVariants.map((variant) => variant.slug).join(","), "tan");
  const trending = presentation.taggedProducts([product], "isTrending");
  assert.equal(trending[0].colorVariants.map((variant) => variant.slug).join(","), "blue");
  assert.equal(presentation.taggedProducts([product], "isBestSeller").length, 0);
});

test("admin schema retains independent homepage ranks and rejects invalid numbering", () => {
  const draft = structuredClone(product);
  draft.colorVariants[0].homepageRanks = { isNew: 9, isTrending: 1, isBestSeller: 25, shopByCategory: 3 };
  const parsed = admin.AdminProductSchema.parse(draft);
  const saved = admin.normalizeProductImages(parsed);
  assert.deepEqual(JSON.parse(JSON.stringify(saved.colorVariants[0].homepageRanks)), draft.colorVariants[0].homepageRanks);
  for (const invalid of [0, -1, 1.5, "1", null, Infinity]) {
    draft.colorVariants[0].homepageRanks.isTrending = invalid;
    assert.equal(admin.AdminProductSchema.safeParse(draft).success, false, String(invalid));
    draft.colorVariants[0].homepageRanks.isTrending = 1;
    draft.colorVariants[0].homepageRanks.shopByCategory = invalid;
    assert.equal(admin.AdminProductSchema.safeParse(draft).success, false, String(invalid));
    draft.colorVariants[0].homepageRanks.shopByCategory = 3;
  }
});

test("admin requires variants and stores compatibility fields only from the first colour", () => {
  assert.equal(admin.AdminProductSchema.safeParse({ ...product, colorVariants: [] }).success, false);
  const missingImage = structuredClone(product);
  missingImage.colorVariants[1].image = "";
  assert.equal(admin.AdminProductSchema.safeParse(missingImage).success, false);
  const missingPrice = structuredClone(product);
  delete missingPrice.colorVariants[1].price;
  assert.equal(admin.AdminProductSchema.safeParse(missingPrice).success, false);
  const duplicateId = structuredClone(product);
  duplicateId.colorVariants[1].variantId = duplicateId.colorVariants[0].variantId;
  assert.equal(admin.AdminProductSchema.safeParse(duplicateId).success, false);
  const cleared = structuredClone(product);
  Object.assign(cleared.colorVariants[0], { price: 3500, compareAtPrice: undefined, description: "", features: [], specs: {}, gallery: [] });
  const saved = admin.normalizeProductImages(cleared);
  assert.equal(saved.price, 3500);
  assert.equal(saved.compareAtPrice, undefined);
  assert.equal(saved.description, "");
  assert.equal(saved.features.length, 0);
  assert.equal(Object.keys(saved.specs).length, 0);
  assert.equal(saved.gallery.join(","), "/blue.webp");
  assert.equal(saved.colorVariants[1].image, "/tan.webp");
  assert.equal(admin.initializeProductVariants(saved).colorVariants[0].compareAtPrice, undefined);
  const legacy = structuredClone(product);
  delete legacy.colorVariants[0].gallery;
  delete legacy.colorVariants[1].gallery;
  legacy.image = legacy.colorVariants[0].image;
  legacy.gallery = [legacy.image, "/legacy-blue-detail.webp"];
  const migrated = admin.initializeProductVariants(legacy);
  assert.equal(migrated.colorVariants[0].gallery.join(","), "/blue.webp,/legacy-blue-detail.webp");
  assert.equal(migrated.colorVariants[1].gallery.length, 0);
});

test("admin save retains edits and reports failure instead of showing success or navigating", async () => {
  const state = [];
  let cursor;
  let fail = true;
  let refreshes = 0;
  let invalidations = 0;
  const bodies = [];
  let finishSave;
  let holdSave = false;
  const saveRef = { current: false };
  const { EnhancedProductForm } = load("src/components/admin/enhanced-product-form.tsx", {
    react: { useRef: () => saveRef, useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
    } },
    "next/link": { default: "link" },
    "next/navigation": { useRouter: () => ({ refresh() { refreshes++; } }) },
    "@/types/product": types,
    "@/lib/admin-product": admin,
    "@/store/product-cache": { useProductCache: { getState: () => ({ invalidate() { invalidations++; } }) } },
    "./product-image-editor": { ProductImageEditor: "images" },
  }, {
    fetch: async (_url, options) => {
      bodies.push(JSON.parse(options.body));
      if (holdSave) await new Promise((resolve) => { finishSave = resolve; });
      return { ok: !fail, json: async () => fail ? { error: "Database unavailable" } : { success: true } };
    },
  });
  function render() { cursor = 0; return EnhancedProductForm({ product, categories: categories.SHOP_CATEGORIES }); }
  const headings = nodes(render()).filter((node) => node.type === "h2").map((node) => node.props.children);
  assert.ok(headings.includes("Product Group"));
  assert.ok(headings.includes("Colour Variants"));
  assert.ok(!headings.includes("Product Images"));
  assert.ok(!headings.includes("Product Page Content"));
  const group = nodes(render()).find((node) => node.type === "section");
  assert.ok(!nodes(group).some((node) => node.type === "input" && node.props.value === product.slug));
  assert.ok(!nodes(group).some((node) => node.type === "label" && node.props.children?.[0] === "Product Page Slug"));
  nodes(render()).find((node) => node.type === "button" && node.props["aria-expanded"] === false).props.onClick();
  function rankInput(label) {
    const field = nodes(render()).find((node) => node.type === "label" && node.props.children?.[0] === label && nodes(node).some((child) => child.type === "input"));
    return nodes(field).find((node) => node.type === "input");
  }
  rankInput("New Arrivals").props.onChange({ target: { value: "7" } });
  rankInput("Most Trending").props.onChange({ target: { value: "2" } });
  rankInput("Best Sellers").props.onChange({ target: { value: "9" } });
  const categoryRank = () => nodes(render()).find((node) => node.type === "label" && node.props.children?.[0] === "Shop by Category rank")
    ?.props.children.find((node) => node?.type === "input");
  categoryRank().props.onChange({ target: { value: "3" } });
  assert.equal(rankInput("Most Trending").props.value, 2);
  await render().props.onSubmit({ preventDefault() {} });
  assert.ok(nodes(render()).some((node) => node.props?.role === "alert" && node.props.children === "Database unavailable"));
  assert.equal(nodes(render()).filter((node) => node.props?.role === "status").length, 0);
  assert.equal(refreshes, 0);
  assert.equal(bodies[0].colorVariants[0].description, "Blue description");
  assert.equal(bodies[0].colorVariants[0].pageSlug, "test-bag-blue");
  assert.equal(bodies[0].shippingReturns, "Blue policy");
  assert.equal(bodies[0].slug, product.slug, "Existing group links must remain compatible");
  assert.deepEqual(bodies[0].colorVariants[0].homepageRanks, { isNew: 7, isTrending: 2, isBestSeller: 9, shopByCategory: 3 });
  fail = false;
  await render().props.onSubmit({ preventDefault() {} });
  assert.equal(refreshes, 1);
  assert.equal(invalidations, 1);
  assert.equal(nodes(render()).filter((node) => node.props?.role === "status").length, 1);
  rankInput("Most Trending").props.onChange({ target: { value: "" } });
  categoryRank().props.onChange({ target: { value: "" } });
  await render().props.onSubmit({ preventDefault() {} });
  assert.deepEqual(bodies.at(-1).colorVariants[0].homepageRanks, { isNew: 7, isBestSeller: 9 });
  holdSave = true;
  const form = render();
  const start = performance.now();
  const pending = form.props.onSubmit({ preventDefault() {} });
  assert.ok(performance.now() - start < 100, "Saving feedback must appear before the response");
  await form.props.onSubmit({ preventDefault() {} });
  assert.equal(bodies.length, 4, "Repeated save clicks must produce only one request");
  const waiting = nodes(render()).find((node) => node.type === "button" && node.props.type === "submit");
  assert.equal(waiting.props.children, "Saving...");
  assert.equal(waiting.props.disabled, true);
  assert.equal(waiting.props["aria-busy"], true);
  finishSave();
  await pending;
});

test("new groups save without entering a group slug and keep variant page slugs editable", async () => {
  const state = [];
  let cursor = 0;
  const bodies = [];
  const { EnhancedProductForm } = load("src/components/admin/enhanced-product-form.tsx", {
    react: {
      useRef: () => ({ current: false }),
      useState(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
        return [state[index], (value) => { state[index] = typeof value === "function" ? value(state[index]) : value; }];
      },
    },
    "next/link": { default: "link" },
    "next/navigation": { useRouter: () => ({ refresh() {} }) },
    "@/types/product": types,
    "@/lib/admin-product": admin,
    "@/store/product-cache": { useProductCache: { getState: () => ({ invalidate() {} }) } },
    "./product-image-editor": { ProductImageEditor: "images" },
  }, {
    crypto: { randomUUID: () => "12345678-1234-1234-1234-123456789012" },
    fetch: async (url, options) => {
      assert.equal(url, "/api/admin/products");
      bodies.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({ success: true }) };
    },
  });
  function render() {
    cursor = 0;
    return EnhancedProductForm({ product: { ...product, slug: undefined }, categories: categories.SHOP_CATEGORIES, isNew: true });
  }
  const group = nodes(render()).find((node) => node.type === "section");
  assert.ok(!nodes(group).some((node) => node.type === "input" && String(node.props.value).startsWith("group-")));
  nodes(render()).find((node) => node.type === "button" && node.props["aria-expanded"] === false).props.onClick();
  const variantSlug = nodes(render()).find((node) => node.type === "input" && node.props.value === "test-bag-blue");
  variantSlug.props.onChange({ target: { value: "new-blue-bag" } });
  await render().props.onSubmit({ preventDefault() {} });
  assert.equal(bodies.length, 1);
  assert.equal(bodies[0].slug, "group-12345678-1234-1234-1234-123456789012");
  assert.equal(bodies[0].colorVariants[0].pageSlug, "new-blue-bag");
  assert.equal(admin.AdminProductSchema.safeParse(bodies[0]).success, true);
});

test("image uploads retain selection order, report failures and keep successful files in the draft", async () => {
  const state = [];
  let cursor = 0;
  let changes;
  const requests = [];
  const busy = [];
  const { ProductImageEditor } = load("src/components/admin/product-image-editor.tsx", {
    react: { useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], (value) => { state[index] = value; }];
    } },
    "@/components/ui/image": { default: "image" },
  }, {
    FormData,
    crypto: { randomUUID: () => `file-${requests.length}` },
    fetch: async (_url, options) => {
      requests.push(options.body.get("file").name);
      const success = requests.length !== 3;
      return { ok: success, json: async () => success ? { url: `/${requests.at(-1)}` } : { error: "Upload rejected" } };
    },
  });
  const props = { images: [], path: "products/test", onChange: (value) => { changes = value; }, onBusy: (value) => busy.push(value) };
  const input = nodes(ProductImageEditor(props)).find((node) => node.type === "input");
  await input.props.onChange({ currentTarget: { files: ["first.webp", "second.webp", "third.webp"].map((name) => new File(["image"], name, { type: "image/webp" })), value: "selected" } });
  assert.equal(requests.join(","), "first.webp,second.webp,third.webp");
  assert.equal(changes.join(","), "/first.webp,/second.webp");
  assert.equal(busy.join(","), "true,false");
  cursor = 0;
  assert.ok(nodes(ProductImageEditor(props)).some((node) => node.props?.role === "alert" && node.props.children === "Upload rejected"));
});

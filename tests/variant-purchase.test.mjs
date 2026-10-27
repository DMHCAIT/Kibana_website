import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { z } from "zod";
import presentation from "./helpers/product-presentation.mjs";

const product = {
  id: "bag", slug: "bag", name: "Parent bag", price: 1000, image: "/parent.webp",
  category: "tote-bag", gallery: ["/parent-detail.webp"],
  colorVariants: [
    { variantId: "blue-id", slug: "blue", color: "Blue", productTitle: "Blue bag", price: 2000, image: "/blue.webp" },
    { variantId: "tan-id", slug: "tan", color: "Tan", productTitle: "Tan bag", price: 3500, image: "/tan.webp", gallery: [] },
  ],
};
const cartItem = { product, quantity: 2, selectedColorSlug: "tan", variantId: "bag-tan" };
const plain = (value) => JSON.parse(JSON.stringify(value));
const expected = {
  productId: "bag", variantId: "tan-id", name: "Tan bag", price: 3500,
  quantity: 2, image: "/tan.webp", color: "Tan", colorSlug: "tan",
};

function load(file, imports, globals = {}) {
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const { outputText } = ts.transpileModule(
    readFileSync(new URL(`../${file}`, import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } },
  );
  vm.runInNewContext(outputText, {
    exports,
    console: { log() {}, warn() {}, error() {} },
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name === "@/lib/product-presentation") return presentation;
      assert.ok(Object.hasOwn(imports, name), `Unexpected import: ${name}`);
      return imports[name];
    },
    ...globals,
  });
  return exports;
}

function nodes(tree) {
  if (!tree || typeof tree !== "object") return [];
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)];
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join("");
  return tree && typeof tree === "object" ? text(tree.props?.children) : tree == null || tree === false ? "" : String(tree);
}

test("purchase snapshots resolve exact slugs, actual IDs and legacy IDs without substituting another colour", () => {
  assert.deepEqual(plain(presentation.orderItemFromCart(cartItem)), expected);
  for (const variantId of ["tan-id", "bag-tan"]) {
    assert.deepEqual(plain(presentation.orderItemFromCart({ product, quantity: 2, variantId })), expected);
  }
  assert.throws(() => presentation.orderItemFromCart({ ...cartItem, selectedColorSlug: "deleted" }), /no longer available/);
  assert.throws(() => presentation.orderItemFromCart({ product, quantity: 1, variantId: "deleted-id" }), /no longer available/);
  assert.equal(presentation.unavailableProductSelection({ ...product, colorVariants: [] }, undefined, "tan-id"), true);
  assert.deepEqual(plain(presentation.orderItemFromCart({
    product: { ...product, colorVariants: [] }, quantity: 1,
  })), { productId: "bag", name: "Parent bag", price: 1000, quantity: 1, image: "/parent.webp" });
});

for (const method of ["cod", "upi", "card"]) {
  test(`${method} checkout persists and emails only the selected variant snapshot`, async () => {
    const state = [2, { fullName: "Customer", phone: "9999999999", addressLine1: "Street", addressLine2: "", city: "City", state: "State", pincode: "123456" }, method, false, {}, null, true];
    let cursor = 0;
    let cleared = 0;
    let finishOrder;
    const submissionRef = { current: false };
    const requests = [];
    const { CheckoutView } = load("src/app/checkout/checkout-view.tsx", {
      react: {
        useRef: () => submissionRef,
        useState(initial) {
          const index = cursor++;
          if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
          return [state[index], (value) => { state[index] = value; }];
        },
        useEffect() {},
      },
      "next/link": { default: "link" },
      "lucide-react": Object.fromEntries(["ShoppingBag", "MapPin", "CreditCard", "Check", "ChevronRight", "Banknote", "Smartphone", "ArrowLeft", "Loader2"].map((name) => [name, name])),
      "@/components/ui/image": { default: "image" },
      "@/components/ui/button": { Button: "button" },
      "@/store/cart-store": {
        useCart: (selector) => selector({ items: [cartItem], isLoading: false, clear() { cleared++; } }),
        generateVariantId: (id, color) => `${id}-${color}`,
      },
      "@/store/auth-store": { useAuth: () => ({ user: { id: "customer", name: "Customer", email: "customer@example.test" } }) },
      "@/lib/utils": {
        formatINR: (price) => `INR ${price}`,
        getProductDisplayName: (_product, variant) => variant?.productTitle,
      },
      "@/lib/product-images": { getShopDisplayImage: (_product, variant) => variant.image },
      "@/components/payment/upi-payment": { UPIPayment: "upi" },
      "@/components/payment/card-payment": { CardPayment: "card" },
      "@/lib/analytics": { trackCheckout() {}, trackPurchase() {} },
    }, {
      fetch: async (url, options) => {
        requests.push({ url, body: JSON.parse(options.body) });
        if (url === "/api/admin/orders") await new Promise((resolve) => { finishOrder = resolve; });
        return { ok: true };
      },
      alert(message) { assert.fail(message); },
    });
    const tree = CheckoutView();
    assert.ok(text(tree).includes("Tan bag"));
    assert.ok(text(tree).includes("INR 7000"));
    assert.ok(!text(tree).includes("Parent bag"));
    assert.ok(nodes(tree).filter((node) => node.type === "image").every((node) => node.props.src === "/tan.webp"));
    const elements = nodes(tree);
    const submit = method === "cod"
      ? () => elements.find((node) => node.type === "button" && text(node).includes("Place Order")).props.onClick()
      : () => elements.find((node) => node.type === method).props.onSuccess("payment-id");
    const start = performance.now();
    const pending = submit();
    assert.ok(performance.now() - start < 100, "Order-saving feedback must not wait for the response");
    await submit();
    assert.equal(requests.length, 1, "Duplicate submissions must not create another order");
    assert.equal(cleared, 0, "The cart must not be cleared before the order is saved");
    cursor = 0;
    const waiting = CheckoutView();
    assert.ok(nodes(waiting).some((node) => node.props?.role === "status" && text(node).includes("Saving your order")));
    assert.ok(!text(waiting).includes("Order Placed!"));
    finishOrder();
    await pending;
    assert.equal(requests.length, 2);
    assert.equal(requests[0].url, "/api/admin/orders");
    assert.deepEqual(requests[0].body.items, [expected]);
    assert.equal(requests[0].body.total, method === "cod" ? 7100 : 6900);
    assert.equal(requests[1].url, "/api/orders/send-confirmation");
    assert.deepEqual(requests[1].body.items, requests[0].body.items);
    assert.equal(cleared, 1);
  });
}

test("cart additions persist selected data, restore ID-only selections and roll back failed saves", async () => {
  let state;
  let fail = false;
  let rows = [];
  const requests = [];
  const { useCart } = load("src/store/cart-store.ts", {
    zustand: { create: () => (initialize) => {
      const set = (value) => { state = { ...state, ...(typeof value === "function" ? value(state) : value) }; };
      state = initialize(set, () => state);
      return { getState: () => state };
    } },
    "@/store/auth-store": { useAuth: { getState: () => ({ user: { id: "customer" } }) } },
    "@/store/product-cache": { useProductCache: { getState: () => ({ invalidate() {}, fetch: async () => [product] }) } },
    "@/lib/analytics": { trackAddToCart() {} },
    "@/lib/utils": { getProductDisplayName: (_product, variant) => variant.productTitle },
  }, {
    fetch: async (_url, options) => {
      if (!options) return { ok: true, json: async () => rows };
      requests.push({ method: options.method, body: JSON.parse(options.body) });
      return { ok: !fail, json: async () => ({ error: "Cart save failed" }) };
    },
  });
  await useCart.getState().add(product, 2, "tan");
  assert.equal(useCart.getState().subtotal(), 7000);
  assert.equal(requests[0].body.productName, "Tan bag");
  assert.equal(requests[0].body.productImage, "/tan.webp");
  rows = [{ productId: "bag", quantity: 2, variantId: "tan-id" }];
  await useCart.getState().loadForUser("customer");
  assert.equal(useCart.getState().items[0].selectedColorSlug, "tan");
  await useCart.getState().remove("bag", "tan");
  assert.equal(requests.at(-1).body.variantId, "tan-id");
  fail = true;
  await assert.rejects(useCart.getState().add(product, 1, "tan"), /Cart save failed/);
  assert.equal(useCart.getState().items.length, 0);
  await assert.rejects(useCart.getState().add(product, 1, "deleted"), /no longer available/);
  assert.equal(useCart.getState().items.length, 0);
});

test("cart API takes name and image from the chosen variant, not parent fields sent by a client", async () => {
  const inserted = [];
  const { POST } = load("src/app/api/cart/route.ts", {
    "next/server": { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    "next/headers": { cookies: async () => ({ get: () => ({ value: "customer" }) }) },
    "@/lib/db": { db: {
      select: () => ({ from: () => ({ where: async () => [] }) }),
      insert: () => ({ values: async (value) => inserted.push(value) }),
    } },
    "@/lib/db/schema": { userCart: {} },
    "drizzle-orm": { eq() {}, and() {} },
    crypto: { randomUUID: () => "cart-row" },
    zod: { z },
    "@/lib/server-data": { getProduct: async () => product },
  });
  const response = await POST({ json: async () => ({
    productId: "bag", quantity: 2, color: "tan", variantId: "bag-tan",
    productName: "Parent bag", productImage: "/parent.webp",
  }) });
  assert.equal(response.status, 200);
  assert.equal(inserted[0].productName, "Tan bag");
  assert.equal(inserted[0].productImage, "/tan.webp");
  assert.equal(inserted[0].color, "tan");
  assert.equal(inserted[0].variantId, "bag-tan");
  const invalid = await POST({ json: async () => ({ productId: "bag", quantity: 1, color: "deleted" }) });
  assert.equal(invalid.status, 400);
  const invalidQuantity = await POST({ json: async () => ({ productId: "bag", quantity: 0, color: "tan" }) });
  assert.equal(invalidQuantity.status, 400);
  assert.equal(inserted.length, 1);
});

test("order persistence retains variant identifiers and the historical order image survives catalog changes", async () => {
  let persisted;
  const { POST } = load("src/app/api/admin/orders/route.ts", {
    "next/server": { NextResponse: { json: (body) => body } },
    "next/headers": {},
    "@/lib/server-data": { saveOrder: async (order) => { persisted = order; } },
  });
  const order = { id: "order-1", items: [expected], total: 7000, status: "pending", placedAt: "2026-10-27T00:00:00.000Z" };
  await POST({ json: async () => order });
  assert.deepEqual(persisted.items, [expected]);
  const changed = structuredClone(product);
  changed.colorVariants[1].image = "/new-tan.webp";
  const state = [[order], [changed], false, "order-1", null, null];
  let cursor = 0;
  const { default: OrdersPage } = load("src/app/orders/page.tsx", {
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [state[index], () => {}];
      },
      useEffect() {},
    },
    "next/link": { default: "link" },
    "lucide-react": Object.fromEntries(["Package", "ShoppingBag", "ChevronDown", "Clock", "Truck", "CheckCircle", "XCircle", "AlertCircle", "MapPin", "CreditCard", "User"].map((name) => [name, name])),
    "@/components/ui/image": { default: "image" },
    "@/components/ui/button": { Button: "button" },
    "@/store/auth-store": { useAuth: () => ({ user: { id: "customer" }, _hasHydrated: true }) },
    "@/store/product-cache": {},
    "@/lib/utils": { formatINR: String },
    "@/lib/product-images": { getShopDisplayImage: (_product, variant) => variant.image },
    "@/lib/analytics": {},
    "@/components/analytics/track-page-view": { TrackPageView: "tracking" },
  });
  const tree = OrdersPage();
  const images = nodes(tree).filter((node) => node.type === "image");
  assert.ok(images.length > 0);
  assert.ok(images.every((node) => node.props.src === "/tan.webp"));
  assert.ok(text(tree).includes("Tan bag"));
  assert.ok(!text(tree).includes("Parent bag"));
});

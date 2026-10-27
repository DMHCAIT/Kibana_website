import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import presentation from "./helpers/product-presentation.mjs";

function renderCard(props = {}, user = { id: "customer" }) {
  const additions = [];
  const prompts = [];
  const jsx = (type, props) => ({ type, props });
  const imports = {
    "@/lib/product-presentation": presentation,
    react: { useEffect() {}, useRef: () => ({ current: false }), useState: (value) => [value, () => {}] },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "@/components/ui/image": { default: "image" },
    "@/components/ui/badge": { Badge: "badge" },
    "next/link": { default: "link" },
    "lucide-react": { Heart: "heart", Plus: "plus" },
    "@/lib/utils": {
      cn: (...values) => values.filter(Boolean).join(" "),
      discountPct: () => 0,
      formatINR: (value) => String(value),
    },
    "@/lib/product-images": {
      pickDefaultProductImage: (primary, gallery) => primary || gallery[0],
    },
    "@/store/cart-store": {
      useCart: (selector) => selector({ add: (...args) => additions.push(args) }),
    },
    "@/store/wishlist-store": {
      useWishlist: () => ({ has: () => false, add() {}, remove() {} }),
    },
    "@/store/auth-store": {
      useAuth: () => ({ user, openAuthModal: (message) => prompts.push(message) }),
    },
    "@/lib/analytics": { trackWishlist() {} },
  };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("../src/components/product/product-card.tsx", import.meta.url), "utf8"),
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
    URL,
    require(name) {
      assert.ok(Object.hasOwn(imports, name), `Unexpected import: ${name}`);
      return imports[name];
    },
  });
  const product = {
    id: "bag",
    slug: "bag",
    name: "Bag",
    image: "/parent.webp",
    gallery: ["/parent.webp", "/parent-detail.webp"],
    price: 2799,
    colors: [],
    colorVariants: [
      {
        slug: "blue",
        image: "/blue.webp",
        gallery: ["/blue.webp", "/blue-detail.webp"],
        inStock: true,
      },
      {
        slug: "mocha",
        image: "/mocha.webp",
        gallery: ["/mocha.webp", "/mocha-detail.webp"],
        inStock: true,
      },
    ],
    ...props.product,
  };
  const tree = exports.ProductCard({ ...props, product });
  const nodes = [];
  function visit(node, ancestors = []) {
    if (!node || typeof node !== "object") return;
    nodes.push({ ...node, ancestors });
    for (const child of [node.props?.children].flat(Infinity)) {
      visit(child, [...ancestors, node.type]);
    }
  }
  visit(tree);
  return {
    nodes,
    product,
    additions,
    prompts,
    images: nodes.filter((node) => node.type === "image"),
    addButton: nodes.find(
      (node) => node.type === "button" && node.props["aria-label"]?.endsWith(" to cart"),
    ),
  };
}

test("hover uses only the selected color gallery and images fill the card without side bands", () => {
  const card = renderCard({
    href: "/shop/bag?color=mocha",
    displayImage: "/mocha.webp",
    variant: "full",
  });
  assert.deepEqual(
    card.images.map((image) => image.props.src),
    ["/mocha.webp", "/mocha-detail.webp"],
  );
  for (const image of card.images) {
    assert.match(image.props.className, /object-cover/);
    assert.doesNotMatch(image.props.className, /object-contain/);
    assert.doesNotMatch(image.props.className, /(?:^|\s)p-\d/);
  }
  const frame = card.nodes.find((node) => node.props?.className?.includes("aspect-[4/5]"));
  assert.ok(frame);
  assert.doesNotMatch(frame.props.className, /bg-|border|rounded|(?:^|\s)p-\d/);
  assert.match(card.images[1].props.className, /group-hover:opacity-100/);
});

test("a color without alternate images never borrows the parent or another color gallery", () => {
  for (const gallery of [undefined, [], ["/mocha.webp"]]) {
    const card = renderCard({
      href: "/shop/bag?color=mocha",
      product: { colorVariants: [{ slug: "mocha", image: "/mocha.webp", gallery }] },
    });
    assert.deepEqual(
      card.images.map((image) => image.props.src),
      ["/mocha.webp"],
    );
  }
});

test("products without colors use their own gallery and preserve a single image", () => {
  const card = renderCard({ product: { colorVariants: [] } });
  assert.deepEqual(
    card.images.map((image) => image.props.src),
    ["/parent.webp", "/parent-detail.webp"],
  );
  assert.equal(renderCard({ product: { colorVariants: [], gallery: [] } }).images.length, 1);
});

test("plus adds one exact variant without being nested in a navigation link", () => {
  for (const variant of ["full", "compact"]) {
    const card = renderCard({ variant, href: "/shop/bag?color=mocha" });
    assert.ok(card.addButton);
    assert.equal(card.addButton.props.children.type, "plus");
    assert.equal(card.addButton.ancestors.includes("link"), false);
    assert.doesNotMatch(card.addButton.props.className, /hidden/);
    assert.match(card.addButton.props.className, /group-focus-within:opacity-100/);
    card.addButton.props.onClick();
    assert.deepEqual(card.additions, [[card.product, 1, "mocha"]]);
  }
});

test("product cards do not show decorative color swatches", () => {
  const card = renderCard({ variant: "full" });
  assert.ok(!card.nodes.some((node) => node.props?.style?.backgroundColor));
});

test("default card images and cart additions use the same first color", () => {
  const card = renderCard({ product: { displayImage: "/parent-display.webp" } });
  assert.equal(card.images[0].props.src, "/blue.webp");
  card.addButton.props.onClick();
  assert.deepEqual(card.additions, [[card.product, 1, "blue"]]);
});

test("card controls appear on hover or focus at every screen size without colored hover backgrounds", () => {
  const card = renderCard();
  const wishlist = card.nodes.find((node) => node.props?.["aria-label"] === "Add to wishlist");
  for (const control of [card.addButton, wishlist]) {
    const classes = control.props.className;
    assert.match(classes, /(?:^|\s)opacity-0(?:\s|$)/);
    assert.match(classes, /(?:^|\s)pointer-events-none(?:\s|$)/);
    assert.match(classes, /(?:^|\s)group-hover:opacity-100(?:\s|$)/);
    assert.match(classes, /(?:^|\s)group-hover:pointer-events-auto(?:\s|$)/);
    assert.match(classes, /(?:^|\s)group-focus-within:opacity-100(?:\s|$)/);
    assert.doesNotMatch(classes, /md:|rounded|hover:bg-|hover:text-/);
  }
  assert.match(card.addButton.props.className, /(?:^|\s)bg-white(?:\s|$)/);
  assert.match(card.addButton.props.className, /h-8 w-8/);
  assert.match(wishlist.props.className, /(?:^|\s)bg-transparent(?:\s|$)/);
  assert.doesNotMatch(wishlist.props.className, /bg-white/);
});

test("sold-out cards and minimal cards do not offer quick add", () => {
  assert.equal(renderCard({ variantInStock: false }).addButton, undefined);
  assert.equal(
    renderCard({ product: { colorVariants: [{ slug: "blue", inStock: false }] } }).addButton,
    undefined,
  );
  assert.equal(renderCard({ variant: "minimal" }).addButton, undefined);
});

test("sold-out cards use a corner label without a faded full-image overlay", () => {
  const card = renderCard({ variantInStock: false, product: { isBestSeller: true } });
  const badge = card.nodes.find((node) => node.type === "badge");
  assert.equal(badge.props.variant, "soldOut");
  assert.equal(badge.props.children, "Sold Out");
  assert.match(badge.props.className, /left-2 top-2/);
  assert.ok(!card.nodes.some((node) => node.props?.children === "Best Seller"));
  assert.ok(
    !card.nodes.some((node) => /bg-white\/60|bg-black\/50|blur/.test(node.props?.className ?? "")),
  );
});
test("New and Best Seller tags have smaller mobile typography and padding", () => {
  for (const product of [{ isNew: true }, { isBestSeller: true }]) {
    const card = renderCard({ product });
    const tag = card.nodes.find((node) => ["New", "Best Seller"].includes(node.props?.children));
    assert.match(tag.props.className, /text-\[8px\]/);
    assert.match(tag.props.className, /sm:text-\[10px\]/);
    assert.match(tag.props.className, /px-1\.5 py-0\.5/);
    assert.match(tag.props.className, /whitespace-nowrap/);
  }
  const badge = readFileSync(new URL("../src/components/ui/badge.tsx", import.meta.url), "utf8");
  assert.match(badge, /text-\[8px\]/);
  assert.match(badge, /sm:text-\[10px\]/);
});
test("signed-out quick add prompts for login rather than silently doing nothing", () => {
  const card = renderCard({}, null);
  card.addButton.props.onClick();
  assert.equal(card.additions.length, 0);
  assert.deepEqual(card.prompts, ["Please log in to add items to your cart."]);
});

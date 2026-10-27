import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import presentation from "./helpers/product-presentation.mjs";

test("Sling Bags is first and selected by default; category switches retain filtering without rectangular outlines", () => {
  const categories = [
    { slug: "tote-bag", name: "Tote Bags", href: "/category/tote" },
    { slug: "shoulder-bag", name: "Shoulder Bags", href: "/category/shoulder" },
    { slug: "sling-bag", name: "Sling Bags", href: "/category/sling" },
  ];
  let selected;
  const jsx = (type, props) => ({ type, props });
  const imports = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: {
      useState: (initial) => [
        selected ?? initial,
        (value) => {
          selected = value;
        },
      ],
    },
    "next/link": { default: "link" },
    "@/components/product/product-card": { ProductCard: "card" },
    "@/lib/shop-categories": { SHOP_CATEGORIES: categories },
    "@/lib/utils": { cn: (...values) => values.filter(Boolean).join(" ") },
    "@/lib/product-presentation": presentation,
  };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("../src/components/home/shop-by-category.tsx", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  );
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      assert.ok(Object.hasOwn(imports, name), name);
      return imports[name];
    },
  });
  const products = [
    { id: "sling", slug: "sling", name: "Sling", category: "sling-bag", colorVariants: [
      { slug: "unranked", color: "Unranked", image: "/unranked.webp" },
      ...Array.from({ length: 6 }, (_, index) => ({
        slug: `colour-${index}`, color: `Colour ${index}`, image: `/colour-${index}.webp`,
        homepageRanks: { shopByCategory: 6 - index },
      })),
    ] },
    { id: "tote", slug: "tote", category: "tote-bag", colorVariants: [
      { slug: "tan", color: "Tan", image: "/tan.webp", pageSlug: "tote-tan", homepageRanks: { shopByCategory: 1 } },
    ] },
  ];
  function render() {
    const nodes = [];
    function visit(node) {
      if (!node || typeof node !== "object") return;
      nodes.push(node);
      for (const child of [node.props?.children].flat(Infinity)) visit(child);
    }
    visit(exports.ShopByCategory({ products }));
    return nodes;
  }
  const nodes = render();
  const buttons = nodes.filter((node) => node.type === "button");
  const categoryGroup = nodes.find((node) => node.props?.["aria-label"] === "Bag categories");
  assert.match(categoryGroup.props.className, /grid-cols-2/);
  assert.match(categoryGroup.props.className, /sm:grid-cols-4/);
  assert.match(categoryGroup.props.className, /lg:flex/);
  assert.equal(buttons[0].props.children.props.children, "Sling Bags");
  assert.equal(buttons[0].props["aria-pressed"], true);
  assert.equal(nodes.find((node) => node.type === "card").props.product, products[0]);
  const cards = nodes.filter((node) => node.type === "card");
  assert.equal(cards.length, 4);
  cards.forEach((card, index) => {
    assert.equal(card.props.product, products[0]);
    assert.equal(card.props.href, `/shop/sling?color=colour-${5 - index}`);
    assert.equal(card.props.displayImage, `/colour-${5 - index}.webp`);
    assert.equal(card.props.variantKey, `sling-colour-${5 - index}`);
  });
  assert.equal(nodes.find((node) => node.type === "link").props.href, "/category/sling");
  for (const button of buttons) {
    assert.match(button.props.className, /font-sans/);
    assert.match(button.props.className, /text-\[12px\]/);
    assert.match(button.props.className, /font-normal/);
    assert.match(button.props.className, /tracking-\[0\.08em\]/);
    assert.match(button.props.className, /lg:tracking-\[0\.2em\]/);
    assert.match(button.props.className, /min-h-11/);
    assert.match(button.props.className, /min-w-0/);
    assert.match(button.props.className, /leading-\[18px\]/);
    assert.doesNotMatch(button.props.className, /font-jost|uppercase/);
    assert.match(button.props.className, /outline-none/);
    assert.doesNotMatch(button.props.className, /focus-visible:outline/);
    assert.match(button.props.children.props.className, /rounded-full/);
    assert.match(button.props.children.props.className, /max-w-full whitespace-normal/);
    assert.match(button.props.children.props.className, /group-focus-visible\/category:ring-2/);
  }
  buttons[1].props.onClick();
  const updated = render();
  assert.equal(updated.find((node) => node.type === "card").props.product, products[1]);
  assert.equal(updated.filter((node) => node.type === "card").length, 1);
  assert.equal(updated.find((node) => node.type === "card").props.href, "/shop/tote-tan");
  assert.equal(updated.find((node) => node.type === "link").props.href, "/category/tote");
  assert.equal(categories[0].slug, "tote-bag");
  updated.filter((node) => node.type === "button")[2].props.onClick();
  const empty = render();
  assert.equal(empty.filter((node) => node.type === "card").length, 0);
  assert.ok(empty.some((node) => node.props?.role === "status" && node.props.children[0] === 0));
});

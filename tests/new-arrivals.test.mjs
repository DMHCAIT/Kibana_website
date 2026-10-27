import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import presentation from "./helpers/product-presentation.mjs";

const jsx = (type, props) => ({ type, props });
const imports = {
  "@/lib/product-presentation": presentation,
  "react/jsx-runtime": { jsx, jsxs: jsx },
  "next/link": { default: "link" },
  "@/components/product/product-card": { ProductCard: "product-card" },
};
const { outputText } = ts.transpileModule(
  readFileSync(new URL("../src/components/home/new-arrivals.tsx", import.meta.url), "utf8"),
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
    assert.ok(Object.hasOwn(imports, name), `Unexpected import: ${name}`);
    return imports[name];
  },
});

function render(products) {
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    nodes.push(node);
    for (const child of [node.props?.children].flat(Infinity)) visit(child);
  }
  visit(exports.NewArrivals({ products }));
  return {
    nodes,
    cards: nodes.filter((node) => node.type === "product-card"),
    link: nodes.find((node) => node.type === "link"),
  };
}

test("new arrivals uses ranked variants and retains their full parent product for sibling colours", () => {
  const variant = { variantId: "blue", slug: "blue", color: "Blue", productTitle: "Blue bag", image: "/blue.webp", homepageRanks: { isNew: 7 } };
  const tagged = { id: "brand-new", slug: "new-bag", name: "New bag", isNew: true, colorVariants: [variant] };
  const result = render([
    { id: "p11", slug: "halo-mini", isNew: false, colorVariants: [] },
    { id: "p9", slug: "valera-dome", colorVariants: [] },
    tagged,
  ]);
  assert.equal(result.cards.length, 1);
  assert.equal(result.cards[0].props.product, tagged);
  assert.equal(result.cards[0].props.href, "/shop/new-bag?color=blue");
  assert.equal(result.cards[0].props.displayImage, "/blue.webp");
  assert.equal(result.cards[0].props.displayName, "Blue bag");
  assert.equal(result.cards[0].props.variantKey, "brand-new-blue");
  tagged.isNew = false;
  assert.equal(render([tagged]).cards.length, 0);
});

test("homepage keeps four ranked variants while view all remains the unbounded tagged collection", () => {
  const products = Array.from({ length: 6 }, (_, i) => ({
    id: `new-${i}`,
    slug: `new-bag-${i}`,
    isNew: true,
    colorVariants: [{ variantId: `v-${i}`, slug: "blue", color: "Blue", image: "/blue.webp", homepageRanks: { isNew: 6 - i } }],
  }));
  const result = render(products);
  assert.equal(result.cards.length, 4);
  result.cards.forEach((card, i) => assert.equal(card.props.product, products[5 - i]));
  const url = new URL(result.link.props.href, "http://localhost");
  assert.equal(url.pathname, "/new-arrivals");
  assert.equal(url.search, "");
});

test("no tagged products shows an empty message without an unfiltered view-all link", () => {
  for (const products of [[], [{ id: "p11", isNew: false, colorVariants: [] }], [{ id: "tagged-only", isNew: true, colorVariants: [{ slug: "blue" }] }]]) {
    const result = render(products);
    assert.equal(result.cards.length, 0);
    assert.equal(result.link, undefined);
    assert.ok(
      result.nodes.some(
        (node) => node.props?.children === "No new arrivals available at the moment.",
      ),
    );
  }
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import presentation from "./helpers/product-presentation.mjs";

const product = {
  id: "bag", slug: "bag", name: "Bag", isNew: true, isTrending: true, isBestSeller: true,
  colorVariants: Array.from({ length: 7 }, (_, index) => ({
    variantId: `v-${index}`, slug: `colour-${index}`, color: `Colour ${index}`,
    image: `/colour-${index}.webp`, productTitle: `Bag ${index}`,
    homepageRanks: { isNew: 7 - index, isTrending: index + 10, isBestSeller: (index + 1) * 2 },
  })),
};
const slugs = (items) => items.map(({ variant }) => variant.slug).join(",");

test("each homepage section independently sorts and caps at four variants, even within one group", () => {
  const before = JSON.stringify(product);
  assert.equal(slugs(presentation.homepageVariants([product], "isNew")), "colour-6,colour-5,colour-4,colour-3");
  assert.equal(slugs(presentation.homepageVariants([product], "isTrending")), "colour-0,colour-1,colour-2,colour-3");
  assert.equal(slugs(presentation.homepageVariants([product], "isBestSeller")), "colour-0,colour-1,colour-2,colour-3");
  assert.equal(presentation.homepageVariants([product], "isNew")[0].product, product);
  assert.equal(JSON.stringify(product), before);
});

test("tags can be unlimited but only tagged numbered colours appear on the homepage", () => {
  const custom = structuredClone(product);
  delete custom.colorVariants[0].homepageRanks;
  custom.colorVariants[1].homepageRanks.isNew = undefined;
  custom.colorVariants[2].isNew = false;
  custom.colorVariants[3].homepageRanks.isNew = 0;
  custom.colorVariants[4].homepageRanks.isNew = -1;
  custom.colorVariants[5].homepageRanks.isNew = 1.5;
  assert.equal(slugs(presentation.homepageVariants([custom], "isNew")), "colour-6");
  assert.equal(presentation.taggedProducts([custom], "isNew")[0].colorVariants.length, 6);
  custom.isNew = false;
  assert.equal(presentation.homepageVariants([custom], "isNew").length, 0);
  custom.colorVariants[6].isNew = true;
  assert.equal(slugs(presentation.homepageVariants([custom], "isNew")), "colour-6");
  assert.equal(presentation.homepageVariants([{ ...custom, colorVariants: [] }], "isNew").length, 0);
});

test("equal ranks use stable product IDs and colour keys, not incoming catalog order", () => {
  const a = { ...product, id: "a", colorVariants: [
    { ...product.colorVariants[0], slug: "z", homepageRanks: { isNew: 1 } },
    { ...product.colorVariants[1], slug: "a", homepageRanks: { isNew: 1 } },
  ] };
  const b = { ...product, id: "b", colorVariants: [{ ...product.colorVariants[2], homepageRanks: { isNew: 1 } }] };
  const identities = (catalog) => presentation.homepageVariants(catalog, "isNew")
    .map(({ product, variant }) => `${product.id}-${variant.slug}`).join(",");
  assert.equal(identities([b, a]), "a-a,a-z,b-colour-2");
  assert.equal(identities([a, b]), identities([b, a]));
});

test("category ranking is independent of marketing tags and other homepage ranks", () => {
  const custom = structuredClone(product);
  custom.isNew = false;
  custom.isTrending = false;
  custom.isBestSeller = false;
  custom.colorVariants.forEach((variant, index) => {
    variant.homepageRanks.shopByCategory = 7 - index;
  });
  assert.equal(slugs(presentation.homepageVariants([custom], "shopByCategory")), "colour-6,colour-5,colour-4,colour-3");
  delete custom.colorVariants[6].homepageRanks.shopByCategory;
  assert.equal(slugs(presentation.homepageVariants([custom], "shopByCategory")), "colour-5,colour-4,colour-3,colour-2");
});

test("Best Sellers renders the exact four ranked variants with full sibling data", () => {
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const imports = {
    "@/lib/product-presentation": presentation,
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "next/link": { default: "link" },
    "@/components/product/product-card": { ProductCard: "card" },
    "./section-heading": { SectionHeading: "heading" },
  };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("../src/components/home/best-sellers.tsx", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  );
  vm.runInNewContext(outputText, { exports, require(name) {
    assert.ok(Object.hasOwn(imports, name), name);
    return imports[name];
  } });
  function nodes(tree) {
    if (!tree || typeof tree !== "object") return [];
    return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)];
  }
  const cards = nodes(exports.BestSellers({ products: [product] })).filter((node) => node.type === "card");
  assert.equal(cards.length, 4);
  cards.forEach((card, index) => {
    assert.equal(card.props.product, product);
    assert.equal(card.props.href, `/shop/bag?color=colour-${index}`);
    assert.equal(card.props.displayImage, `/colour-${index}.webp`);
    assert.equal(card.props.variantKey, `bag-colour-${index}`);
  });
  const unranked = { ...product, colorVariants: product.colorVariants.map((variant) => ({ ...variant, homepageRanks: {} })) };
  assert.equal(nodes(exports.BestSellers({ products: [unranked] })).filter((node) => node.type === "card").length, 0);
});

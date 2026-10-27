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
  react: { useRef: () => ({ current: null }) },
  "@/components/ui/image": { default: "image" },
  "next/link": { default: "link" },
  "lucide-react": { ChevronLeft: "previous", ChevronRight: "next" },
  "@/lib/product-images": { pickDefaultProductImage: (image, gallery) => image || gallery?.[0] },
  "./section-heading": { SectionHeading: "heading" },
};
const { outputText } = ts.transpileModule(
  readFileSync(new URL("../src/components/home/most-trending.tsx", import.meta.url), "utf8"),
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
  visit(exports.MostTrending({ products }));
  return nodes;
}

test("Most Trending uses tagged catalog names, images and product links without fixed overrides or exclusions", () => {
  const products = [
    {
      id: "p1",
      slug: "actual-product",
      name: "Actual title",
      image: "/actual.webp",
      isTrending: true,
      colorVariants: [{ slug: "blue", image: "/actual.webp", productTitle: "Actual title", homepageRanks: { isTrending: 1 } }],
    },
    {
      id: "p11",
      slug: "halo-mini",
      name: "Halo",
      image: "/halo.webp",
      displayImage: "/halo-display.webp",
      isTrending: true,
      colorVariants: [{ slug: "tan", image: "/halo.webp", productTitle: "Halo", homepageRanks: { isTrending: 2 } }],
    },
    {
      id: "p2",
      slug: "untagged",
      name: "Not trending",
      image: "/not-trending.webp",
      isTrending: false,
      colorVariants: [],
    },
  ];
  const nodes = render(products);
  assert.deepEqual(
    nodes.filter((node) => node.type === "link").map((node) => node.props.href),
    ["/shop/actual-product?color=blue", "/shop/halo-mini?color=tan"],
  );
  assert.deepEqual(
    nodes.filter((node) => node.type === "image").map((node) => node.props.src),
    ["/actual.webp", "/halo.webp"],
  );
  assert.ok(nodes.some((node) => node.props?.children === "Actual title"));
  assert.ok(nodes.some((node) => node.props?.children === "Halo"));
  products[0].isTrending = false;
  assert.equal(render(products).filter((node) => node.type === "link").length, 1);
});

test("Most Trending sorts numbered variants and limits the carousel to four", () => {
  const products = Array.from({ length: 8 }, (_, index) => ({
    id: `p${20 - index}`,
    slug: `product-${index}`,
    name: `Product ${index}`,
    image: `/product-${index}.webp`,
    isTrending: true,
    colorVariants: [{ slug: "blue", image: `/product-${index}.webp`, homepageRanks: { isTrending: 8 - index } }],
  }));
  assert.deepEqual(
    render(products)
      .filter((node) => node.type === "link")
      .map((node) => node.props.href),
    products.slice().reverse().slice(0, 4).map((product) => `/shop/${product.slug}?color=blue`),
  );
});

test("empty or untagged catalogs show an empty state without static fallback images or carousel controls", () => {
  for (const products of [undefined, [], [{ id: "p1", isTrending: false, colorVariants: [] }], [{ id: "unranked", isTrending: true, colorVariants: [{ slug: "blue" }] }]]) {
    const nodes = render(products);
    assert.equal(nodes.filter((node) => ["link", "image", "button"].includes(node.type)).length, 0);
    assert.ok(
      nodes.some(
        (node) => node.props?.children === "No trending products available at the moment.",
      ),
    );
  }
});

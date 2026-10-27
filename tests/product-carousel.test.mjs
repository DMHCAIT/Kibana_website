import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

test("related carousel fits four desktop cards, supports mobile swiping and scrolls by measured card width", () => {
  const jsx = (type, props) => ({ type, props });
  const scrolls = [];
  const container = {
    firstElementChild: { getBoundingClientRect: () => ({ width: 300 }) },
    scrollBy: (options) => scrolls.push(options),
  };
  const imports = {
    react: {
      useRef: () => ({ current: container }),
      useState: () => [true, () => {}],
      useEffect() {},
    },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "lucide-react": { ChevronLeft: "left", ChevronRight: "right" },
    "./product-card": { ProductCard: "card" },
  };
  const { outputText } = ts.transpileModule(
    readFileSync(
      new URL("../src/components/product/product-carousel.tsx", import.meta.url),
      "utf8",
    ),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  );
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    getComputedStyle: () => ({ columnGap: "48px" }),
    require(name) {
      assert.ok(Object.hasOwn(imports, name), name);
      return imports[name];
    },
  });
  const items = Array.from({ length: 5 }, (_, index) => ({
    key: `bag-${index}`,
    product: { id: `bag-${index}` },
    href: `/shop/bag?color=${index}`,
  }));
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    nodes.push(node);
    for (const child of [node.props?.children].flat(Infinity)) visit(child);
  }
  visit(exports.ProductCarousel({ items }));
  const scrollArea = nodes.find((node) => node.props?.onScroll);
  assert.match(nodes[0].props.className, /group\/carousel/);
  for (const arrow of nodes.filter((node) => node.type === "button")) {
    assert.match(arrow.props.className, /(?:^|\s)opacity-0(?:\s|$)/);
    assert.match(arrow.props.className, /pointer-events-none/);
    assert.match(arrow.props.className, /group-hover\/carousel:opacity-100/);
    assert.match(arrow.props.className, /group-focus-within\/carousel:opacity-100/);
    assert.match(arrow.props.className, /md:opacity-100/);
  }
  assert.match(scrollArea.props.className, /snap-x/);
  assert.match(scrollArea.props.className, /lg:gap-12/);
  const wrappers = nodes.filter((node) => node.props?.className?.includes("snap-start"));
  assert.equal(wrappers.length, 5);
  assert.match(wrappers[0].props.className, /w-\[72%\]/);
  assert.match(wrappers[0].props.className, /lg:w-\[calc\(\(100%-144px\)\/4\)\]/);
  assert.equal(nodes.filter((node) => node.type === "card")[0].props.variantKey, items[0].key);
  nodes.find((node) => node.props?.["aria-label"] === "Scroll right").props.onClick();
  nodes.find((node) => node.props?.["aria-label"] === "Scroll left").props.onClick();
  assert.deepEqual(
    scrolls.map((value) => value.left),
    [348, -348],
  );
});

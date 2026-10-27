import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

test("Style in Motion uses the four requested Mocha names and links while keeping its videos", () => {
  const jsx = (type, props) => ({ type, props });
  const imports = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: { useRef: () => ({ current: null }), useState: () => [false, () => {}], useEffect() {} },
    "next/link": { default: "link" },
    "lucide-react": { Truck: "truck", Gem: "gem", RotateCcw: "returns" },
    "./section-heading": { SectionHeading: "heading" },
  };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("../src/components/home/style-in-motion.tsx", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  );
  const exports = {};
  vm.runInNewContext(outputText, { exports, require(name) {
    assert.ok(Object.hasOwn(imports, name), name);
    return imports[name];
  } });
  function nodes(tree) {
    if (!tree || typeof tree !== "object") return [];
    if (typeof tree.type === "function") return nodes(tree.type(tree.props));
    return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)];
  }
  const elements = nodes(exports.StyleInMotion());
  const links = elements.filter((node) => node.type === "link");
  assert.deepEqual(links.map((node) => node.props.href), [
    "/shop/sandesh-mocha", "/shop/vistara-mocha", "/shop/prizma-mocha", "/shop/vistapack-mocha",
  ]);
  assert.deepEqual(elements.filter((node) => node.type === "p" && node.props.className?.includes("product-title"))
    .map((node) => node.props.children), ["Sandesh - Mocha", "Vistara - Mocha", "Prizma - Mocha", "Vistapack - Mocha"]);
  assert.deepEqual(elements.filter((node) => node.type === "video").map((node) => node.props.src), [
    "/videos/compressed/Sandesh%20Laptop%20bag.mp4",
    "/videos/compressed/VISTARA%20TOTE%20BAG.mp4",
    "/videos/compressed/PRIZMA%20SLING.mp4",
    "/videos/compressed/HALO%20MINI%20Optimized.mp4",
  ]);
});

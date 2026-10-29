import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

test("hero displays only the first banner's desktop and mobile images without slideshow controls", () => {
  const jsx = (type, props) => ({ type, props });
  const imports = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "@/components/ui/image": { default: "image" },
  };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("../src/components/home/hero-banner.tsx", import.meta.url), "utf8"),
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
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    nodes.push(node);
    for (const child of [node.props?.children].flat(Infinity)) visit(child);
  }
  visit(exports.HeroBanner());
  const banner = nodes.find((node) => node.type === "div" && /aspect-\[4\/5\]/.test(node.props.className));
  assert.ok(banner);
  assert.match(banner.props.className, /sm:aspect-\[3\/1\]/);
  const images = nodes.filter((node) => node.type === "image");
  assert.deepEqual(
    images.map((image) => image.props.src),
    ["/mv/women-hero-desktop.webp", "/mv/hero1.webp"],
  );
  assert.match(images[0].props.className, /hidden.*sm:block/);
  assert.match(images[1].props.className, /sm:hidden/);
  assert.ok(images.every((image) => image.props.quality === 100));
  assert.ok(images.every((image) => image.props.priority && image.props.sizes === "100vw"));
  assert.equal(nodes.filter((node) => node.type === "button").length, 0);
  assert.ok(!nodes.some((node) => node.props?.["aria-roledescription"] === "carousel"));
  assert.equal(nodes.filter((node) => node.type === "link").length, 0);
});

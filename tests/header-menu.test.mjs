import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

test("desktop shop dropdown closes after selection even while focus and hover remain", () => {
  const state = [];
  const listeners = new Map();
  let cursor;
  let effects;
  let cleanups = [];
  const jsx = (type, props) => ({ type, props });
  const imports = {
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = initial;
        return [
          state[index],
          (value) => {
            state[index] = value;
          },
        ];
      },
      useEffect(effect) {
        effects.push(effect);
      },
    },
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "next/link": { default: "link" },
    "next/navigation": { usePathname: () => "/shop", useRouter: () => ({}) },
    "lucide-react": new Proxy({}, { get: (_target, name) => name }),
    "@/store/cart-store": { useCart: (selector) => selector({ items: [] }) },
    "@/store/auth-store": { useAuth: () => ({ user: null }) },
    "@/lib/shop-categories": { SHOP_CATEGORIES: [{ slug: "tote-bag", name: "Tote Bags" }] },
    "@/lib/utils": { cn: (...values) => values.filter(Boolean).join(" ") },
  };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("../src/components/layout/header-new.tsx", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  );
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    document: {
      body: { style: {} },
      addEventListener: (name, handler) => listeners.set(name, handler),
      removeEventListener: (name) => listeners.delete(name),
    },
    require: (name) => {
      assert.ok(Object.hasOwn(imports, name), name);
      return imports[name];
    },
  });
  function render() {
    cursor = 0;
    effects = [];
    const result = [];
    function visit(node) {
      if (!node || typeof node !== "object") return;
      result.push(node);
      for (const child of [node.props?.children].flat(Infinity)) visit(child);
    }
    visit(exports.Header({}));
    return {
      wrapper: result.find((node) => node.props?.onMouseEnter),
      link: result.find((node) => node.props?.["aria-controls"] === "desktop-shop-categories"),
      panel: result.find((node) => node.props?.id === "desktop-shop-categories"),
    };
  }
  function commitMenuEffect() {
    cleanups.forEach((cleanup) => cleanup?.());
    // The second effect owns document-level dropdown dismissal.
    cleanups = [effects[1]()];
  }
  assert.equal(render().link.props["aria-expanded"], false);
  render().wrapper.props.onMouseEnter();
  assert.equal(render().link.props["aria-expanded"], true);
  render().wrapper.props.onClickCapture();
  assert.equal(render().link.props["aria-expanded"], false);
  assert.match(render().panel.props.className, /invisible/);
  render().wrapper.props.onMouseLeave();
  render().wrapper.props.onMouseEnter();
  assert.equal(render().link.props["aria-expanded"], true);
  commitMenuEffect();
  listeners.get("click")();
  assert.equal(render().link.props["aria-expanded"], false);
  render().wrapper.props.onFocusCapture({
    currentTarget: { contains: () => false },
    relatedTarget: null,
  });
  assert.equal(render().link.props["aria-expanded"], true);
  commitMenuEffect();
  listeners.get("keydown")({ key: "Escape" });
  assert.equal(render().link.props["aria-expanded"], false);
  render().wrapper.props.onMouseEnter();
  render().wrapper.props.onBlurCapture({
    currentTarget: { contains: () => false },
    relatedTarget: null,
  });
  assert.equal(render().link.props["aria-expanded"], false);
});

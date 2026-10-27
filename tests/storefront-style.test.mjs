import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import postcss from "postcss";
import ts from "typescript";

const css = postcss.parse(readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8"));

function declarations(selector, media) {
  const values = {};
  css.walkRules(selector, (rule) => {
    const query = rule.parent.type === "atrule" ? rule.parent.params : undefined;
    if (query !== media) return;
    rule.walkDecls((declaration) => {
      values[declaration.prop] = declaration.value;
    });
  });
  return values;
}

test("public routes share the storefront theme while admin routes opt out", () => {
  let pathname = "/";
  const jsx = (type, props) => ({ type, props });
  const imports = {
    "next/navigation": { usePathname: () => pathname },
    "@/lib/utils": { cn: (...classes) => classes.filter(Boolean).join(" ") },
    "react/jsx-runtime": { jsx, jsxs: jsx },
  };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("../src/components/layout/storefront-shell.tsx", import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
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
  const child = { type: "page" };
  for (const route of [
    "/",
    "/shop",
    "/shop/bag",
    "/about",
    "/contact",
    "/faqs",
    "/returns",
    "/cart",
    "/checkout",
    "/account",
    "/orders",
    "/wishlist",
    "/administrator",
  ]) {
    pathname = route;
    const shell = exports.StorefrontShell({ children: child });
    assert.match(shell.props.className, /(?:^|\s)storefront(?:\s|$)/, route);
    assert.equal(shell.props.children, child);
  }
  for (const route of ["/admin", "/admin/login", "/admin/products/new"]) {
    pathname = route;
    const shell = exports.StorefrontShell({ children: child });
    assert.doesNotMatch(shell.props.className, /storefront/, route);
    assert.equal(shell.props.children, child);
  }
});

test("storefront typography and responsive spacing match the measured reference scale", () => {
  const base = declarations(".storefront");
  assert.equal(base["font-size"], "14px");
  assert.equal(base["font-weight"], "400");
  assert.equal(base["line-height"], "1.65");
  assert.equal(base["--storefront-gutter"], "20px");
  assert.equal(base["--storefront-section-space"], "40px");
  assert.equal(base["--storefront-stack-gap"], "36px");
  const desktop = declarations(".storefront", "(min-width: 1000px)");
  assert.equal(desktop["--storefront-gutter"], "48px");
  assert.equal(desktop["--storefront-section-space"], "64px");
  assert.equal(declarations(".storefront", "(min-width: 700px)")["--storefront-stack-gap"], "48px");
  const productTitle = declarations(".storefront .product-title");
  assert.equal(productTitle["font-size"], "12px");
  assert.equal(productTitle["line-height"], "1.7");
  assert.equal(declarations(".storefront h1.storefront-product-title")["font-size"], "18px");
  assert.equal(
    declarations(".storefront h1.storefront-product-title", "(min-width: 1000px)")["font-size"],
    "22px",
  );
});

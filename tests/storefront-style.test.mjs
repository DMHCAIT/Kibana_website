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

test("footer spacing is compact only below the desktop breakpoint", () => {
  assert.equal(
    declarations(".storefront .storefront-footer .storefront-section-space", "(max-width: 1023px)")["padding-block"],
    "24px",
  );
  assert.equal(
    declarations(".storefront .storefront-footer h4", "(max-width: 1023px)")["margin-bottom"],
    "12px",
  );
  assert.deepEqual(declarations(".storefront .storefront-footer .storefront-section-space"), {});
});

test("homepage pill buttons scale and stay within mobile and tablet containers", () => {
  const selector = ".storefront .storefront-home :is(.btn-pill, .btn-pill-outline)";
  const compact = declarations(selector, "(max-width: 1023px)");
  assert.equal(compact["max-width"], "100%");
  assert.equal(compact["min-width"], "0");
  assert.equal(compact["padding"], "10px clamp(16px, 3vw, 24px)");
  assert.equal(compact["font-size"], "clamp(11px, 1.5vw, 12px)");
  assert.equal(compact["letter-spacing"], "0.12em");
  assert.equal(compact["overflow-wrap"], "anywhere");
  assert.deepEqual(declarations(selector), {});
});

test("footer groups Support directly below About on mobile and tablet", () => {
  const jsx = (type, props) => ({ type, props });
  const imports = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "next/link": { default: "a" },
    "lucide-react": { Facebook: "facebook", Instagram: "instagram", Youtube: "youtube" },
    "./newsletter-form": { NewsletterForm: "newsletter" },
    "@/lib/shop-categories": {
      SHOP_CATEGORIES: [{ name: "Tote Bags", href: "/shop/tote-bag" }],
    },
  };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("../src/components/layout/footer.tsx", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  );
  const exports = {};
  vm.runInNewContext(outputText, { exports, require(name) {
    assert.ok(Object.hasOwn(imports, name), name);
    return imports[name];
  } });
  function nodes(tree) {
    if (!tree || typeof tree !== "object") return [];
    if (Array.isArray(tree)) return tree.flatMap(nodes);
    return [tree, ...nodes(tree.props?.children)];
  }
  const elements = nodes(exports.Footer());
  const copyright = elements.find((node) =>
    node.type === "p" && [node.props.children].flat().join("").includes("All rights reserved"),
  );
  assert.ok(copyright);
  const copyrightRow = elements.find((node) => node.props?.children === copyright);
  assert.match(copyrightRow.props.className, /(?:^|\s)hidden(?:\s|$)/);
  assert.match(copyrightRow.props.className, /(?:^|\s)lg:block(?:\s|$)/);
  const groups = elements.filter((node) => node.props?.className?.includes("lg:contents"));
  assert.deepEqual(groups.map((group) =>
    nodes(group).filter((node) => node.type === "h4").map((node) => node.props.children),
  ), [["Shop"], ["About", "Support"]]);
  assert.ok(groups.every((group) => group.props.className.includes("lg:space-y-0")));
  const grid = elements.find((node) => node.props?.className?.includes("grid-cols-2"));
  assert.match(grid.props.className, /lg:grid-cols-\[1.4fr_1fr_1fr_1fr\]/);
  assert.ok(elements.filter((node) => node.type === "ul")
    .every((node) => node.props.className === "space-y-2 lg:space-y-3"));
});

test("homepage spacing is tighter at each breakpoint without changing other routes", () => {
  for (const [media, padding, gap] of [
    [undefined, 24, 24],
    ["(min-width: 700px)", 32, 28],
    ["(min-width: 1000px)", 40, 32],
  ]) {
    const home = declarations(".storefront-home", media);
    assert.equal(home["--storefront-section-space"], `${padding}px`);
    assert.equal(home["--storefront-stack-gap"], `${gap}px`);
    assert.ok(padding < parseInt(declarations(".storefront", media)["--storefront-section-space"]));
  }
  assert.equal(
    declarations(".storefront-home .container")["padding-block"],
    "var(--storefront-section-space)",
  );
  assert.equal(
    declarations(".storefront-section-heading")["margin-bottom"],
    "var(--storefront-stack-gap)",
  );
  assert.equal(
    declarations(".storefront-stack-margin")["margin-top"],
    "var(--storefront-stack-gap)",
  );
});

test("New Arrivals has a modest extra top gap without increasing other section spacing", () => {
  const spacing = declarations(".storefront-home .storefront-new-arrivals > .container");
  assert.deepEqual(spacing, {
    "padding-top": "calc(var(--storefront-section-space) + 20px)",
  });
  const source = readFileSync(
    new URL("../src/components/home/new-arrivals.tsx", import.meta.url), "utf8",
  );
  assert.match(source, /<section className="storefront-new-arrivals w-full">/);
});

test("homepage keeps section titles but removes the requested promotional text", () => {
  const jsx = (type, props) => ({ type, props });
  const imports = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: {
      useRef: () => ({ current: null }),
      useState: () => [false, () => {}],
      useEffect() {},
    },
    "next/link": { default: "a" },
    "@/components/ui/image": { default: "img" },
    "@/components/product/product-card": { ProductCard: "product-card" },
    "@/lib/product-images": { pickDefaultProductImage: (image) => image },
    "@/lib/product-presentation": { homepageVariants: () => [] },
    "@/lib/utils": { cn: (...classes) => classes.filter(Boolean).join(" ") },
    "lucide-react": {
      Truck: "truck", Gem: "gem", RotateCcw: "returns",
      ChevronLeft: "left", ChevronRight: "right",
    },
  };
  function load(name) {
    const { outputText } = ts.transpileModule(
      readFileSync(new URL(`../src/components/home/${name}.tsx`, import.meta.url), "utf8"),
      { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
    );
    const exports = {};
    vm.runInNewContext(outputText, { exports, require(name) {
      assert.ok(Object.hasOwn(imports, name), `Unexpected import: ${name}`);
      return imports[name];
    } });
    return exports;
  }
  imports["./section-heading"] = load("section-heading");
  function text(tree) {
    if (tree == null || typeof tree === "boolean") return "";
    if (Array.isArray(tree)) return tree.map(text).join(" ");
    if (typeof tree !== "object") return String(tree);
    if (typeof tree.type === "function") return text(tree.type(tree.props));
    return text(tree.props?.children);
  }
  for (const [file, component, title] of [
    ["new-arrivals", "NewArrivals", "New Arrivals"],
    ["best-sellers", "BestSellers", "Best Sellers"],
    ["most-trending", "MostTrending", "Most Trending"],
    ["style-in-motion", "StyleInMotion", "Style in Motion"],
  ]) {
    const rendered = text(load(file)[component]({ products: [] }));
    assert.ok(rendered.includes(title), title);
    for (const removed of [
      "JUST ARRIVED", "Discover the latest expressions of KIBANA.",
      "MOST LOVED", "The pieces defining the KIBANA edit.",
      "What everyone is obsessing over", "See our bags in action",
    ]) {
      assert.ok(!rendered.includes(removed), `${file}: ${removed}`);
    }
  }
});

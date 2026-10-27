import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const jsx = (type, props) => ({ type, props });

function loadModule(relativePath, imports) {
  const { outputText } = ts.transpileModule(readFileSync(path.join(root, relativePath), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    process: { env: {} },
    require(name) {
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      assert.ok(Object.hasOwn(imports, name), `Unexpected import: ${name}`);
      return imports[name];
    },
  });
  return exports;
}

test("shared image defaults to quality 95 and preserves responsive and loading properties", () => {
  const Image = loadModule("src/components/ui/image.tsx", {
    "next/image": { default: "next-image" },
  }).default;
  const props = {
    src: "/bag.webp",
    alt: "Bag",
    fill: true,
    priority: true,
    sizes: "100vw",
    className: "object-cover",
  };
  const image = Image(props);
  assert.equal(image.type, "next-image");
  assert.equal(image.props.quality, 95);
  for (const [key, value] of Object.entries(props)) assert.equal(image.props[key], value);
});

test("image configuration supports full-width high-density displays", () => {
  const config = loadModule("next.config.ts", {
    "next/constants": { PHASE_DEVELOPMENT_SERVER: "development-server" },
  }).default("production-build");
  for (const width of [1920, 2048, 2560, 3840])
    assert.ok(config.images.deviceSizes.includes(width));
  assert.ok(config.images.imageSizes.includes(64));
});

test("all Next.js images use the shared high-quality default without lower quality overrides", () => {
  function check(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const filename = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        check(filename);
      } else if (entry.name.endsWith(".tsx")) {
        const source = readFileSync(filename, "utf8");
        if (filename === path.join(root, "src/components/ui/image.tsx")) continue;
        assert.doesNotMatch(source, /from ["']next\/image["']/, filename);
        for (const match of source.matchAll(/quality=\{(\d+)\}/g)) {
          assert.ok(Number(match[1]) >= 95, `Low image quality in ${filename}`);
        }
      }
    }
  }
  check(path.join(root, "src"));
});

test("sold-out product galleries show corner labels on mobile and desktop without fading images", () => {
  const { ProductGallery } = loadModule("src/app/shop/[slug]/product-gallery.tsx", {
    react: {
      useState: (value) => [value, () => {}],
      useRef: () => ({ current: null }),
      useEffect() {},
      useCallback: (callback) => callback,
    },
    "@/components/ui/image": { default: "image" },
    "@/components/ui/badge": { Badge: "badge" },
    "lucide-react": { ChevronLeft: "previous", ChevronRight: "next", X: "close", ZoomIn: "zoom" },
  });
  function render(inStock) {
    const nodes = [];
    function visit(node) {
      if (!node || typeof node !== "object") return;
      nodes.push(node);
      for (const child of [node.props?.children].flat(Infinity)) visit(child);
    }
    visit(
      ProductGallery({
        images: ["/bag.webp"],
        productName: "Bag",
        discountPct: 60,
        variantInStock: inStock,
      }),
    );
    return nodes;
  }
  const nodes = render(false);
  const badges = nodes.filter((node) => node.type === "badge");
  assert.equal(badges.length, 2);
  for (const badge of badges) {
    assert.equal(badge.props.variant, "soldOut");
    assert.equal(badge.props.children, "Sold Out");
    assert.match(badge.props.className, /left-\d top-\d/);
  }
  assert.ok(
    !nodes.some((node) => /bg-black\/50|blur|opacity-50/.test(node.props?.className ?? "")),
  );
  assert.equal(nodes.filter((node) => node.type === "image").length, 2);
  assert.equal(render(true).filter((node) => node.props?.variant === "discount").length, 2);
});

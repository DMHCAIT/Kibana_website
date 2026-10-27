import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

test("mobile bottom navigation has four evenly spaced items and preserves cart and authentication actions", () => {
  let user = null;
  let prompts = 0;
  const routes = [];
  const jsx = (type, props) => ({ type, props });
  const imports = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "next/link": { default: "link" },
    "lucide-react": Object.fromEntries(["Home", "Heart", "ShoppingBag", "User"].map((name) => [name, name])),
    "@/store/cart-store": { useCart: (selector) => selector({ items: [{ quantity: 2 }] }) },
    "@/store/auth-store": { useAuth: () => ({ user, openAuthModal() { prompts++; } }) },
    "next/navigation": { useRouter: () => ({ push: (route) => routes.push(route) }), usePathname: () => "/" },
  };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("../src/components/layout/mobile-bottom-nav.tsx", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  );
  const exports = {};
  vm.runInNewContext(outputText, { exports, require(name) {
    assert.ok(Object.hasOwn(imports, name), name);
    return imports[name];
  } });
  function nodes(tree) {
    if (!tree || typeof tree !== "object") return [];
    return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)];
  }
  function text(tree) {
    if (Array.isArray(tree)) return tree.map(text).join("");
    return tree && typeof tree === "object" ? text(tree.props?.children) : tree == null || tree === false ? "" : String(tree);
  }
  const tree = exports.MobileBottomNav();
  const elements = nodes(tree);
  assert.match(tree.props.className, /md:hidden/);
  assert.equal(elements.find((node) => node.type === "ul").props.className, "grid grid-cols-4");
  assert.equal(elements.filter((node) => node.type === "li").length, 4);
  assert.ok(!text(tree).includes("All Products"));
  assert.equal(elements.find((node) => node.type === "link" && node.props.href === "/").props.children[1], "Home");
  const cart = elements.find((node) => node.type === "link" && node.props.href === "/cart");
  assert.ok(text(cart).includes("Cart"));
  assert.ok(text(cart).includes("2"));
  const buttons = elements.filter((node) => node.type === "button");
  assert.equal(text(buttons[0]), "Wishlist");
  assert.equal(text(buttons[1]), "Login");
  buttons.forEach((button) => button.props.onClick());
  assert.equal(prompts, 2);
  user = { id: "customer" };
  const signedIn = nodes(exports.MobileBottomNav()).filter((node) => node.type === "button");
  assert.equal(text(signedIn[1]), "Account");
  signedIn.forEach((button) => button.props.onClick());
  assert.deepEqual(routes, ["/wishlist", "/account"]);
});

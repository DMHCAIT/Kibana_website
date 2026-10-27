import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadModule(relativePath, imports, globals = {}) {
  const filename = path.join(__dirname, "..", relativePath);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  vm.runInNewContext(
    outputText,
    {
      exports,
      require(name) {
        assert.ok(Object.hasOwn(imports, name), `Unexpected import: ${name}`);
        return imports[name];
      },
      setTimeout,
      clearTimeout,
      console,
      ...globals,
    },
    { filename },
  );
  return exports;
}

function createProductsSource(query, hasDatabase = true, globals = {}) {
  const errors = [];
  const logger = { warn() {}, error(...args) { errors.push(args); } };
  const retry = loadModule("src/lib/db-retry.ts", {}, { console: logger });
  const localProducts = [{ id: "local", name: "Local product" }];
  const source = loadModule(
    "src/lib/server-data.ts",
    {
      "@/lib/db": {
        db: { select: () => ({ from: () => ({ orderBy: query }) }) },
      },
      "@/lib/admin-product": { assertUniqueProductSlugs() {} },
      "@/lib/db/schema": { products: { sortOrder: "sortOrder" } },
      "drizzle-orm": { asc: (value) => value },
      "@/lib/data": { products: localProducts },
      "@/lib/db-retry": retry,
      "@/data/categories.json": [],
      "@/data/site-config.json": {},
    },
    { process: { env: { DATABASE_URL: hasDatabase ? "configured" : "" } }, ...globals },
  );
  return { ...source, errors, localProducts };
}

test("a product query slower than two seconds resolves with products, not cached emptiness", async () => {
  let calls = 0;
  const source = createProductsSource(async () => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 2100));
    return [{ id: "p1", name: "Loaded product" }];
  });

  const products = await source.getProducts();
  assert.equal(products.length, 1);
  assert.equal(products[0].id, "p1");
  assert.equal(await source.getProducts(), products);
  assert.equal(calls, 1);
});

test("temporary query failures retry automatically within the original request", async () => {
  let calls = 0;
  const source = createProductsSource(async () => {
    if (++calls < 3) throw new Error("Temporary connection failure");
    return [{ id: "p1" }];
  });

  assert.equal((await source.getProducts())[0].id, "p1");
  assert.equal(calls, 3);
});

test("failed requests report errors and do not poison the product cache", async () => {
  let unavailable = true;
  const source = createProductsSource(async () => {
    if (unavailable) throw new Error("Database unavailable");
    return [{ id: "p1" }];
  });

  await assert.rejects(source.getProducts(), /Database unavailable/);
  assert.equal(source.errors.length, 1);
  unavailable = false;
  assert.equal((await source.getProducts())[0].id, "p1");
});

test("concurrent catalog requests share one query and successful result", async () => {
  let calls = 0;
  let resolve;
  const source = createProductsSource(() => {
    calls++;
    return new Promise((done) => { resolve = done; });
  });
  const requests = Array.from({ length: 20 }, () => source.getProducts());
  assert.equal(calls, 1);
  resolve([{ id: "p1" }]);
  const products = await Promise.all(requests);
  assert.ok(products.every((result) => result === products[0]));
  assert.equal(calls, 1);
});

test("concurrent failed requests share retries and allow a later recovery", async () => {
  let calls = 0;
  let unavailable = true;
  const source = createProductsSource(async () => {
    calls++;
    if (unavailable) throw new Error("statement timeout");
    return [{ id: "p1" }];
  });
  const results = await Promise.allSettled(
    Array.from({ length: 20 }, () => source.getProducts()),
  );
  assert.ok(results.every((result) => result.status === "rejected"));
  assert.equal(calls, 3);
  assert.equal(source.errors.length, 1);
  unavailable = false;
  assert.equal((await source.getProducts())[0].id, "p1");
  assert.equal(calls, 4);
});

test("a genuinely empty catalog stays empty rather than falling back to local products", async () => {
  const source = createProductsSource(async () => []);
  assert.equal((await source.getProducts()).length, 0);
});

test("local products remain available when no database is configured", async () => {
  const source = createProductsSource(() => assert.fail("Database must not be queried"), false);
  assert.equal(await source.getProducts(), source.localProducts);
});

test("database pool uses native query deadlines and is reused without background timers", () => {
  let calls = 0;
  let options;
  const client = () => Promise.resolve([]);
  const createClient = (_url, config) => {
    calls++;
    options = config;
    return client;
  };
  const globals = {
    process: { env: { DATABASE_URL: "postgres://test", NODE_ENV: "development" } },
    globalThis: {},
    setInterval: () => assert.fail("Hot reload must not start background health checks"),
  };
  const imports = {
    postgres: { default: createClient },
    "drizzle-orm/postgres-js": { drizzle: (sql) => sql },
    "./schema": {},
  };
  const first = loadModule("src/lib/db/index.ts", imports, globals);
  const reloaded = loadModule("src/lib/db/index.ts", imports, globals);

  assert.equal(calls, 1);
  assert.equal(first.db, reloaded.db);
  assert.equal(globals.globalThis.__kibana_pg, client);
  assert.equal(options.connection.statement_timeout, 10000);
  assert.equal(options.connection.lock_timeout, 5000);
  assert.equal(options.connect_timeout, 8);
  assert.equal(options.prepare, false);
  assert.equal(options.onconnect, undefined);
  assert.equal(options.onerror, undefined);
});

test("local development and production use separate Next.js build directories", () => {
  const config = loadModule("next.config.ts", {
    "next/constants": { PHASE_DEVELOPMENT_SERVER: "development-server" },
  }, { process: { env: {} } }).default;

  assert.equal(config("development-server").distDir, ".next");
  assert.equal(config("production-build").distDir, ".next-build");
  assert.equal(config("production-server").distDir, ".next-build");
});

test("Vercel builds and runtime use the default directory required by deployment packaging", () => {
  const config = loadModule("next.config.ts", {
    "next/constants": { PHASE_DEVELOPMENT_SERVER: "development-server" },
  }, { process: { env: { VERCEL: "1" } } }).default;
  assert.equal(config("production-build").distDir, ".next");
  assert.equal(config("production-server").distDir, ".next");
});

test("the dev script uses a fixed port rather than silently starting another server", () => {
  const manifest = JSON.parse(readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
  assert.equal(manifest.scripts.dev, "next dev --port 3003");
});

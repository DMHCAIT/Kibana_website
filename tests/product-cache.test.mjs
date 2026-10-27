import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function cacheWith(fetch) {
  let state;
  const exports = {};
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("../src/store/product-cache.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
  );
  vm.runInNewContext(outputText, {
    exports, fetch, console: { error() {} },
    require(name) {
      assert.equal(name, "zustand");
      return { create: () => (initialize) => {
        state = initialize((value) => { state = { ...state, ...value }; }, () => state);
        return { getState: () => state };
      } };
    },
  });
  return exports.useProductCache;
}

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}
const response = (products) => ({ ok: true, json: async () => products });

test("20 concurrent page loads share one pending catalog request and show loading immediately", async () => {
  const network = deferred();
  let requests = 0;
  const cache = cacheWith(() => { requests++; return network.promise; });
  const start = performance.now();
  const promises = Array.from({ length: 20 }, () => cache.getState().fetch());
  assert.ok(performance.now() - start < 100, "Starting requests must not wait for network completion");
  assert.equal(cache.getState().isLoading, true);
  assert.equal(requests, 1);
  assert.ok(promises.every((promise) => promise === promises[0]));
  const products = [{ id: "bag" }];
  network.resolve(response(products));
  assert.ok((await Promise.all(promises)).every((result) => result === products));
  assert.equal(cache.getState().isLoading, false);
  assert.equal(await cache.getState().fetch(), products);
  assert.equal(requests, 1);
});

test("empty catalogs are cached too, avoiding repeated requests for empty collections", async () => {
  let requests = 0;
  const cache = cacheWith(async () => { requests++; return response([]); });
  await cache.getState().fetch();
  await cache.getState().fetch();
  assert.equal(requests, 1);
});

test("invalidation preserves visible products while an older response cannot overwrite a fresh result", async () => {
  const old = deferred();
  const fresh = deferred();
  let requests = 0;
  const cache = cacheWith(() => (++requests === 1 ? old.promise : fresh.promise));
  const oldRequest = cache.getState().fetch();
  cache.getState().invalidate();
  const newRequest = cache.getState().fetch();
  fresh.resolve(response([{ id: "new" }]));
  await newRequest;
  old.resolve(response([{ id: "old" }]));
  await oldRequest;
  assert.equal(cache.getState().products[0].id, "new");
  cache.getState().invalidate();
  assert.equal(cache.getState().products[0].id, "new");
  assert.equal(cache.getState().isCached, false);
});

test("server errors are reported and allow a new request rather than returning success-shaped stale data", async () => {
  let requests = 0;
  const cache = cacheWith(async () => ++requests === 1 ? { ok: false } : response([{ id: "recovered" }]));
  await assert.rejects(cache.getState().fetch(), /could not be loaded/);
  assert.equal(cache.getState().isLoading, false);
  assert.equal(cache.getState().isCached, false);
  assert.equal((await cache.getState().fetch())[0].id, "recovered");
});

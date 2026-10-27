import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import sharp from "sharp";

for (const order of ["project-first", "next-first"]) {
  test(`uploads and Next image optimization share one working native library (${order})`, () => {
    const script = `
      const assert = require("node:assert/strict");
      const { createRequire } = require("node:module");
      const nextRequire = createRequire(require.resolve("next/dist/server/image-optimizer"));
      let upload, optimizer;
      if (${JSON.stringify(order)} === "project-first") {
        upload = require("sharp");
        optimizer = nextRequire("sharp");
      } else {
        optimizer = nextRequire("sharp");
        upload = require("sharp");
      }
      assert.equal(upload, optimizer);
      async function run() {
        const source = await upload({create:{width:80,height:60,channels:4,background:{r:20,g:30,b:40,alpha:1}}}).png().toBuffer();
        await Promise.all([upload, optimizer].map(async (processor) => {
          for (const width of [320, 640, 1280]) {
            const result = await processor(source).resize({width}).toBuffer();
            assert.equal((await processor(result).metadata()).width, width);
          }
        }));
      }
      run().catch((error) => { console.error(error); process.exitCode = 1; });
    `;
    const child = spawnSync(process.execPath, ["-e", script], { encoding: "utf8", timeout: 30000 });
    assert.equal(child.error, undefined);
    assert.equal(child.status, 0, child.stderr);
    assert.doesNotMatch(child.stderr, /GLib-GObject-CRITICAL|ERR_DLOPEN_FAILED|invalid unclassed type/);
  });
}

test("admin upload processes a real PNG and saves original plus resized images without contacting storage", async () => {
  const buffer = await sharp({ create: { width: 64, height: 48, channels: 3, background: "#123456" } }).png().toBuffer();
  const data = new FormData();
  data.append("file", new File([buffer], "bag.png", { type: "image/png" }));
  data.append("path", "products/test/bag.png");
  const uploads = [];
  const records = [];
  const errors = [];
  const exports = {};
  const imports = {
    "next/server": { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    "next/headers": { cookies: async () => ({ get: () => ({ value: "authenticated" }) }) },
    "@supabase/supabase-js": { createClient: () => ({ storage: { from: () => ({
      upload: async (path, bytes, options) => { uploads.push({ path, bytes, options }); return { error: null }; },
      getPublicUrl: (path) => ({ data: { publicUrl: `https://storage.example/${path}` } }),
    }) } }) },
    sharp: { default: sharp },
    "@/lib/db": { db: { insert: () => ({ values: async (record) => records.push(record) }) } },
    "@/lib/db/schema": { mediaFiles: {} },
    "drizzle-orm": {},
  };
  const { outputText } = ts.transpileModule(
    readFileSync(new URL("../src/app/api/admin/upload/route.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
  );
  vm.runInNewContext(outputText, {
    exports, Buffer, URL,
    process: { env: {} },
    console: { error: (...args) => errors.push(args) },
    require(name) {
      assert.ok(Object.hasOwn(imports, name), name);
      return imports[name];
    },
  });
  const result = await exports.POST({ formData: async () => data });
  assert.equal(result.status, 200);
  assert.equal(result.body.url, "https://storage.example/products/test/bag.png");
  assert.equal(uploads.length, 4);
  assert.deepEqual(uploads[0].bytes, buffer);
  for (const [index, width] of [320, 640, 1280].entries()) {
    assert.equal((await sharp(uploads[index + 1].bytes).metadata()).width, width);
    assert.equal(result.body.variants[index].width, width);
    assert.equal(uploads[index + 1].options.contentType, "image/png");
  }
  assert.equal(records.length, 1);
  assert.equal(errors.length, 0);
});

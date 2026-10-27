import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  readFileSync(new URL("../src/app/shop/[slug]/estimated-delivery.tsx", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
);
const exports = {};
vm.runInNewContext(outputText, {
  exports,
  require: (name) => {
    assert.ok(["react", "lucide-react", "react/jsx-runtime"].includes(name));
    return {};
  },
});
const { getEstimatedDeliveryDate } = exports;

test("delivery date is four calendar days from today in the requested format", () => {
  assert.equal(getEstimatedDeliveryDate(new Date("2026-10-26T11:24:00Z")), "Friday, 30 Oct 2026");
});

test("India midnight controls the date regardless of the browser or server timezone", () => {
  assert.equal(getEstimatedDeliveryDate(new Date("2026-10-26T18:29:59Z")), "Friday, 30 Oct 2026");
  assert.equal(getEstimatedDeliveryDate(new Date("2026-10-26T18:30:00Z")), "Saturday, 31 Oct 2026");
});

test("calendar addition handles weekends, month-end, year-end and leap years", () => {
  assert.equal(getEstimatedDeliveryDate(new Date("2026-10-29T10:00:00Z")), "Monday, 2 Nov 2026");
  assert.equal(getEstimatedDeliveryDate(new Date("2026-12-29T10:00:00Z")), "Saturday, 2 Jan 2027");
  assert.equal(getEstimatedDeliveryDate(new Date("2028-02-25T10:00:00Z")), "Tuesday, 29 Feb 2028");
});

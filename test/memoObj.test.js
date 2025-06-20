import test from "node:test";
import assert from "node:assert/strict";
import { memoObj } from "../dist/index.js";

test("same object returns itself", () => {
  const obj = { a: 1 };
  const ref1 = memoObj(obj);
  const ref2 = memoObj(obj);
  assert.strictEqual(ref1, ref2);
});

test("objects with same structure are reused", () => {
  const obj1 = { a: 1 };
  const obj2 = { a: 1 };
  const ref1 = memoObj(obj1);
  const ref2 = memoObj(obj2);
  assert.strictEqual(ref1, ref2);
});

test("objects with different values are not reused", () => {
  const obj1 = { a: 1 };
  const obj2 = { a: 2 };
  const ref1 = memoObj(obj1);
  const ref2 = memoObj(obj2);
  assert.notStrictEqual(ref1, ref2);
});

test("objects with different keys are not reused", () => {
  const obj1 = { a: 1 };
  const obj2 = { b: 1 };
  const ref1 = memoObj(obj1);
  const ref2 = memoObj(obj2);
  assert.notStrictEqual(ref1, ref2);
});

test("nested structures with same shape are reused", () => {
  const obj1 = { a: { b: 2 } };
  const obj2 = { a: { b: 2 } };
  const ref1 = memoObj(obj1);
  const ref2 = memoObj(obj2);
  assert.strictEqual(ref1, ref2);
  assert.strictEqual(ref1.a, ref2.a);
});

test("handles circular references", () => {
  const a = {};
  a.self = a;

  const b = {};
  b.self = b;

  const ref1 = memoObj(a);
  const ref2 = memoObj(b);

  assert.strictEqual(ref1, ref2);
  assert.strictEqual(ref1.self, ref1);
  assert.strictEqual(ref2.self, ref2);
});

test("objects with different symbols are not reused", () => {
  const sym = Symbol("x");
  const obj1 = { [sym]: 1 };
  const obj2 = { [Symbol("x")]: 1 };
  const ref1 = memoObj(obj1);
  const ref2 = memoObj(obj2);
  assert.notStrictEqual(ref1, ref2);
});

test("objects with same symbols are reused", () => {
  const sym = Symbol("shared");
  const obj1 = { [sym]: 1 };
  const obj2 = { [sym]: 1 };
  const ref1 = memoObj(obj1);
  const ref2 = memoObj(obj2);
  assert.strictEqual(ref1, ref2);
});

test("primitives are returned as-is", () => {
  assert.strictEqual(memoObj(42), 42);
  assert.strictEqual(memoObj("test"), "test");
  assert.strictEqual(memoObj(null), null);
  assert.strictEqual(memoObj(undefined), undefined);
});

import assert from "node:assert/strict";
import test from "node:test";
import { publicError, validateHintRequest } from "../src/hint.mjs";

const valid = { difficulty: "normal", lives: 2, lastDamage: { cause: "hazard", x: 160, y: 640, time: 4.5 } };

test("accepts a bounded hint request", () => {
  assert.deepEqual(validateHintRequest(valid), valid);
});

test("rejects unknown and invalid request fields", () => {
  assert.equal(validateHintRequest({ ...valid, extra: true }), null);
  assert.equal(validateHintRequest({ ...valid, lastDamage: { ...valid.lastDamage, x: "160" } }), null);
});

test("creates a stable public error", () => {
  assert.deepEqual(publicError("INVALID_REQUEST", "Invalid game state."), { error: { code: "INVALID_REQUEST", message: "Invalid game state." } });
});

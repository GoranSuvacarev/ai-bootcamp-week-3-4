import assert from "node:assert/strict";
import test from "node:test";
import {
  API_ERROR_CODES,
  publicError,
  validateGameStateSnapshot,
  validateHintRequest,
  validateHintResponse,
  validateToolProposal,
} from "../src/hint.mjs";

const context = {
  difficulty: "normal",
  lives: 2,
  lastDamage: { cause: "hazard", x: 160, y: 640, time: 4.5 },
};

test("accepts a bounded hint request and rejects unknown fields", () => {
  assert.deepEqual(validateHintRequest(context), context);
  assert.equal(validateHintRequest({ ...context, extra: true }), null);
  assert.equal(validateHintRequest({ ...context, lastDamage: { ...context.lastDamage, x: "160" } }), null);
});

test("accepts only the get_game_state proposal contract", () => {
  const proposal = { id: "call-1", name: "get_game_state", args: { detail: "summary" } };
  assert.deepEqual(validateToolProposal(proposal), proposal);
  assert.equal(validateToolProposal({ ...proposal, name: "execute_anything" }), null);
  assert.equal(validateToolProposal({ ...proposal, args: { detail: "everything" } }), null);
  assert.equal(validateToolProposal({ ...proposal, args: { detail: "summary", extra: true } }), null);
});

test("validates the minimized game state snapshot and structured hint", () => {
  const snapshot = {
    detail: "summary",
    difficulty: "normal",
    lives: 2,
    recentThreat: "rolling_hazard",
    nearbyObjects: [{ kind: "rolling_hazard", relation: "nearby" }, { kind: "ladder", relation: "next_route" }],
  };
  const hint = {
    hint: "Wait for the rolling hazard to pass, then climb the right ladder.",
    suggestedAction: "wait",
    urgency: "medium",
  };

  assert.deepEqual(validateGameStateSnapshot(snapshot), snapshot);
  assert.equal(validateGameStateSnapshot({ ...snapshot, coordinates: [160, 640] }), null);
  assert.deepEqual(validateHintResponse(hint), hint);
  assert.equal(validateHintResponse({ ...hint, suggestedAction: "run" }), null);
  assert.equal(validateHintResponse({ ...hint, extra: true }), null);
});

test("creates stable public errors", () => {
  assert.deepEqual(
    publicError(API_ERROR_CODES.INVALID_REQUEST, "Invalid game state."),
    { error: { code: "INVALID_REQUEST", message: "Invalid game state." } },
  );
});

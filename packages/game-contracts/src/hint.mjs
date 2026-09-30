export const API_ERROR_CODES = Object.freeze({
  INVALID_REQUEST: "INVALID_REQUEST",
  NOT_FOUND: "NOT_FOUND",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  INVALID_TOOL: "INVALID_TOOL",
  MALFORMED_OUTPUT: "MALFORMED_OUTPUT",
  CANCELLED: "CANCELLED",
  COACH_UNAVAILABLE: "COACH_UNAVAILABLE",
});

const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const hasExactKeys = (value, keys) =>
  isRecord(value) &&
  Object.keys(value).length === keys.length &&
  keys.every((key) => Object.hasOwn(value, key));

const DIFFICULTIES = new Set(["easy", "normal"]);
const DAMAGE_CAUSES = new Set(["hazard", "enemy"]);
const TOOL_DETAILS = new Set(["summary", "tactical"]);
const THREATS = new Set(["rolling_hazard", "patrol_enemy"]);
const OBJECT_KINDS = new Set(["rolling_hazard", "patrol_enemy", "ladder"]);
const OBJECT_RELATIONS = new Set(["nearby", "next_route"]);
const ACTIONS = new Set(["move_left", "move_right", "jump", "climb", "wait", "avoid"]);
const URGENCIES = new Set(["low", "medium", "high"]);

export function validateHintRequest(value) {
  if (!hasExactKeys(value, ["difficulty", "lives", "lastDamage"])) return null;
  const { difficulty, lives, lastDamage } = value;
  if (!DIFFICULTIES.has(difficulty) || !Number.isInteger(lives) || lives < 0 || lives > 3) return null;
  if (!hasExactKeys(lastDamage, ["cause", "x", "y", "time"])) return null;
  if (!DAMAGE_CAUSES.has(lastDamage.cause)) return null;
  if (!Number.isFinite(lastDamage.x) || lastDamage.x < 0 || lastDamage.x > 640) return null;
  if (!Number.isFinite(lastDamage.y) || lastDamage.y < 0 || lastDamage.y > 900) return null;
  if (!Number.isFinite(lastDamage.time) || lastDamage.time < 0) return null;
  return { difficulty, lives, lastDamage: { ...lastDamage } };
}

export function validateToolProposal(value) {
  if (!hasExactKeys(value, ["id", "name", "args"])) return null;
  if (typeof value.id !== "string" || !value.id || value.name !== "get_game_state") return null;
  if (!hasExactKeys(value.args, ["detail"]) || !TOOL_DETAILS.has(value.args.detail)) return null;
  return { id: value.id, name: value.name, args: { detail: value.args.detail } };
}

export function validateGameStateSnapshot(value) {
  if (!hasExactKeys(value, ["detail", "difficulty", "lives", "recentThreat", "nearbyObjects"])) return null;
  if (!TOOL_DETAILS.has(value.detail) || !DIFFICULTIES.has(value.difficulty)) return null;
  if (!Number.isInteger(value.lives) || value.lives < 0 || value.lives > 3 || !THREATS.has(value.recentThreat)) return null;
  if (!Array.isArray(value.nearbyObjects) || value.nearbyObjects.length > 3) return null;
  const nearbyObjects = [];
  for (const object of value.nearbyObjects) {
    if (!hasExactKeys(object, ["kind", "relation"]) || !OBJECT_KINDS.has(object.kind) || !OBJECT_RELATIONS.has(object.relation)) return null;
    nearbyObjects.push({ kind: object.kind, relation: object.relation });
  }
  return {
    detail: value.detail,
    difficulty: value.difficulty,
    lives: value.lives,
    recentThreat: value.recentThreat,
    nearbyObjects,
  };
}

export function validateHintResponse(value) {
  if (!hasExactKeys(value, ["hint", "suggestedAction", "urgency"])) return null;
  if (typeof value.hint !== "string") return null;
  const hint = value.hint.trim();
  if (!hint || hint.length > 300 || !ACTIONS.has(value.suggestedAction) || !URGENCIES.has(value.urgency)) return null;
  return { hint, suggestedAction: value.suggestedAction, urgency: value.urgency };
}

export function publicError(code, message) {
  return { error: { code, message } };
}

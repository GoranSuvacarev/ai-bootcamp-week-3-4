export const API_ERROR_CODES = Object.freeze({
  INVALID_REQUEST: "INVALID_REQUEST",
  NOT_FOUND: "NOT_FOUND",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  COACH_UNAVAILABLE: "COACH_UNAVAILABLE",
});

export function validateHintRequest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (Object.keys(value).length !== 3 || !("difficulty" in value) || !("lives" in value) || !("lastDamage" in value)) return null;
  const { difficulty, lives, lastDamage } = value;
  if (difficulty !== "easy" && difficulty !== "normal") return null;
  if (!Number.isInteger(lives) || lives < 0 || lives > 3) return null;
  if (!lastDamage || typeof lastDamage !== "object" || Array.isArray(lastDamage)) return null;
  if (Object.keys(lastDamage).length !== 4 || lastDamage.cause !== "hazard" && lastDamage.cause !== "enemy") return null;
  if (!Number.isFinite(lastDamage.x) || lastDamage.x < 0 || lastDamage.x > 640) return null;
  if (!Number.isFinite(lastDamage.y) || lastDamage.y < 0 || lastDamage.y > 900) return null;
  if (!Number.isFinite(lastDamage.time) || lastDamage.time < 0) return null;
  return { difficulty, lives, lastDamage: { cause: lastDamage.cause, x: lastDamage.x, y: lastDamage.y, time: lastDamage.time } };
}

export function publicError(code, message) {
  return { error: { code, message } };
}

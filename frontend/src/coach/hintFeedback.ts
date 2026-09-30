export const COACH_UNAVAILABLE_MESSAGE = "AI coach is unavailable right now.";

export function hintMessageFromResult(result: unknown, responseIsOk: boolean) {
  if (!responseIsOk || !result || typeof result !== "object" || Array.isArray(result)) return COACH_UNAVAILABLE_MESSAGE;
  const hint = (result as { hint?: unknown }).hint;
  return typeof hint === "string" && hint.trim() ? hint.trim() : COACH_UNAVAILABLE_MESSAGE;
}

export function canDisplayHint(
  request: AbortController,
  activeRequest: AbortController | null,
  expectedDamage: unknown,
  currentDamage: unknown,
  view: string,
) {
  return request === activeRequest && expectedDamage === currentDamage && view === "playing" && !request.signal.aborted;
}

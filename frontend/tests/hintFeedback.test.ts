import { describe, expect, it } from "vitest";
import { canDisplayHint, COACH_UNAVAILABLE_MESSAGE, hintMessageFromResult } from "../src/coach/hintFeedback";

describe("coach hint feedback", () => {
  it("uses a generic safe message for malformed and failed responses", () => {
    expect(hintMessageFromResult({ hint: "Use the ladder." }, true)).toBe("Use the ladder.");
    expect(hintMessageFromResult({ error: { message: "raw provider detail" } }, false)).toBe(COACH_UNAVAILABLE_MESSAGE);
    expect(hintMessageFromResult({ hint: "" }, true)).toBe(COACH_UNAVAILABLE_MESSAGE);
  });

  it("suppresses stale, aborted, and non-playing hint requests", () => {
    const active = new AbortController();
    expect(canDisplayHint(active, active, "damage-1", "damage-1", "playing")).toBe(true);
    expect(canDisplayHint(active, new AbortController(), "damage-1", "damage-1", "playing")).toBe(false);
    expect(canDisplayHint(active, active, "damage-1", "damage-2", "playing")).toBe(false);
    active.abort();
    expect(canDisplayHint(active, active, "damage-1", "damage-1", "playing")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { DEFAULT_GAME_CONFIG } from "../src/game/config";
import { validateGameConfig } from "../src/game/validation";

describe("validateGameConfig", () => {
  it("accepts the default configuration", () => {
    const result = validateGameConfig(DEFAULT_GAME_CONFIG);

    expect(result).toEqual({ valid: true, value: DEFAULT_GAME_CONFIG, errors: [] });
  });

  it("accepts a complete valid configuration", () => {
    const result = validateGameConfig({
      levelWidth: 800,
      levelHeight: 600,
      lives: 5,
      playerSpeed: 220,
      jumpVelocity: 450,
      gravity: 900,
      difficulty: "easy",
    });

    expect(result.valid).toBe(true);
    expect(result.value.levelWidth).toBe(800);
  });

  it("returns the safe default for missing fields", () => {
    const result = validateGameConfig({ levelWidth: 640 });

    expect(result.valid).toBe(false);
    expect(result.value).toEqual(DEFAULT_GAME_CONFIG);
    expect(result.errors.some((error) => error.field === "levelHeight")).toBe(true);
  });

  it.each([
    ["levelWidth", 0],
    ["levelHeight", -1],
    ["lives", -1],
    ["playerSpeed", 0],
    ["jumpVelocity", -10],
    ["gravity", 0],
  ])("rejects invalid numeric value for %s", (field, value) => {
    const result = validateGameConfig({ ...DEFAULT_GAME_CONFIG, [field]: value });

    expect(result.valid).toBe(false);
    expect(result.value).toEqual(DEFAULT_GAME_CONFIG);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects non-finite numeric values: %s",
    (value) => {
      const result = validateGameConfig({ ...DEFAULT_GAME_CONFIG, gravity: value });

      expect(result.valid).toBe(false);
      expect(result.errors.some((error) => error.field === "gravity")).toBe(true);
    },
  );

  it("rejects unsupported difficulty values", () => {
    const result = validateGameConfig({ ...DEFAULT_GAME_CONFIG, difficulty: "hard" });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.field === "difficulty")).toBe(true);
  });

  it("rejects non-object input without throwing", () => {
    expect(validateGameConfig(null).valid).toBe(false);
    expect(validateGameConfig("invalid").valid).toBe(false);
  });
});

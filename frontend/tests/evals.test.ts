import { describe, expect, it } from "vitest";
import { DEFAULT_GAME_CONFIG } from "../src/game/config";
import { createInitialGameState, updateGame } from "../src/game/rules";
import { validateGameConfig } from "../src/game/validation";
import type { GameInput } from "../src/game/types";

const noInput: GameInput = {
  left: false,
  right: false,
  jump: false,
  climbUp: false,
  climbDown: false,
};

describe("Session 003 evaluation cases", () => {
  it("E1 starts a valid game with the expected initial state", () => {
    const state = createInitialGameState(DEFAULT_GAME_CONFIG);
    const firstUpdate = updateGame(state, noInput, 1 / 60);

    expect(state.phase).toBe("ready");
    expect(state.lives).toBe(3);
    expect(state.score).toBe(0);
    expect(firstUpdate.phase).toBe("playing");
  });

  it("E2 keeps the player inside the configured boundaries", () => {
    const state = createInitialGameState(DEFAULT_GAME_CONFIG);
    state.player.x = 1;
    const left = updateGame(state, { ...noInput, left: true }, 1);

    state.player.x = DEFAULT_GAME_CONFIG.levelWidth - state.player.width - 1;
    const right = updateGame(state, { ...noInput, right: true }, 1);

    expect(left.player.x).toBe(0);
    expect(right.player.x).toBe(DEFAULT_GAME_CONFIG.levelWidth - state.player.width);
  });

  it("E3 safely rejects invalid configuration", () => {
    const result = validateGameConfig({ ...DEFAULT_GAME_CONFIG, gravity: Number.NaN });

    expect(result.valid).toBe(false);
    expect(result.value).toEqual(DEFAULT_GAME_CONFIG);
  });

  it("E4 applies a valid non-default movement configuration", () => {
    const config = {
      ...DEFAULT_GAME_CONFIG,
      playerSpeed: 60,
      jumpVelocity: 300,
      gravity: 500,
    };
    const state = createInitialGameState(config);
    const next = updateGame(state, { ...noInput, right: true }, 0.5);

    expect(next.config).toEqual(config);
    expect(next.player.velocityX).toBe(60);
    expect(next.player.x).toBe(94);
  });
});

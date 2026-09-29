import { describe, expect, it } from "vitest";
import { DEFAULT_GAME_CONFIG } from "../src/game/config";
import { createInitialGameState, updateGame } from "../src/game/rules";
import type { GameInput, GameState } from "../src/game/types";

const noInput: GameInput = {
  left: false,
  right: false,
  jump: false,
  climbUp: false,
  climbDown: false,
};

const updateFrom = (state: GameState, input: GameInput, dt = 1 / 60) =>
  updateGame(state, input, dt);

describe("deterministic game movement", () => {
  it("starts in ready and enters playing on the first update", () => {
    const state = createInitialGameState(DEFAULT_GAME_CONFIG);

    const next = updateFrom(state, noInput);

    expect(state.phase).toBe("ready");
    expect(next.phase).toBe("playing");
  });

  it("produces the same result for the same state, input, and time step", () => {
    const state = createInitialGameState(DEFAULT_GAME_CONFIG);
    const input = { ...noInput, right: true };

    expect(updateFrom(state, input)).toEqual(updateFrom(state, input));
  });

  it("moves horizontally with the fixed configured speed", () => {
    const state = createInitialGameState(DEFAULT_GAME_CONFIG);

    const next = updateFrom(state, { ...noInput, right: true }, 0.5);

    expect(next.player.x).toBe(154);
    expect(next.player.velocityX).toBe(DEFAULT_GAME_CONFIG.playerSpeed);
  });

  it("clamps the player at the left and right boundaries", () => {
    const state = createInitialGameState(DEFAULT_GAME_CONFIG);
    state.player.x = 1;
    const atLeft = updateFrom(state, { ...noInput, left: true }, 1);

    state.player.x = DEFAULT_GAME_CONFIG.levelWidth - state.player.width - 1;
    const atRight = updateFrom(state, { ...noInput, right: true }, 1);

    expect(atLeft.player.x).toBe(0);
    expect(atRight.player.x).toBe(DEFAULT_GAME_CONFIG.levelWidth - state.player.width);
  });

  it("applies gravity and clamps the player at the bottom boundary", () => {
    const state = createInitialGameState(DEFAULT_GAME_CONFIG);
    state.player.x = 0;
    state.player.y = 700;
    state.player.onGround = false;

    const next = updateFrom(state, noInput, 1);

    expect(next.player.y).toBe(DEFAULT_GAME_CONFIG.levelHeight - state.player.height);
    expect(next.player.velocityY).toBe(0);
    expect(next.player.onGround).toBe(true);
  });

  it("clamps upward movement at the top boundary", () => {
    const state = createInitialGameState(DEFAULT_GAME_CONFIG);
    state.player.y = 1;
    state.player.velocityY = -2000;
    state.player.onGround = false;

    const next = updateFrom(state, noInput, 1);

    expect(next.player.y).toBe(0);
    expect(next.player.velocityY).toBe(0);
  });

  it("starts a deterministic jump from the grounded state", () => {
    const state = createInitialGameState(DEFAULT_GAME_CONFIG);

    const next = updateFrom(state, { ...noInput, jump: true });

    expect(next.player.onGround).toBe(false);
    expect(next.player.velocityY).toBeLessThan(0);
    expect(next.player.y).toBeLessThan(state.player.y);
  });

  it("lands on a platform when falling through its top surface", () => {
    const state = createInitialGameState(DEFAULT_GAME_CONFIG);
    state.player.x = 100;
    state.player.y = 600;
    state.player.velocityY = 100;
    state.player.onGround = false;

    const next = updateFrom(state, noInput, 0.5);

    expect(next.player.y).toBe(640);
    expect(next.player.velocityY).toBe(0);
    expect(next.player.onGround).toBe(true);
  });

  it("continues falling when no platform supports the player", () => {
    const state = createInitialGameState(DEFAULT_GAME_CONFIG);
    state.player.x = 0;
    state.player.y = 600;
    state.player.velocityY = -400;
    state.player.onGround = false;

    const next = updateFrom(state, noInput, 0.5);

    expect(next.player.y).toBe(650);
    expect(next.player.onGround).toBe(false);
  });
});

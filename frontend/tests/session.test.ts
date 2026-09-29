import { describe, expect, it } from "vitest";
import {
  createPresentationState,
  transitionPresentation,
} from "../src/presentation/session";
import { createGameSession } from "../src/presentation/gameSession";

describe("presentation session transitions", () => {
  it("starts in the menu and keeps a selected difficulty for a new session", () => {
    const initial = createPresentationState();
    const selected = transitionPresentation(initial, { type: "selectDifficulty", difficulty: "easy" });
    const started = transitionPresentation(selected, { type: "start" });

    expect(initial).toEqual({ view: "menu", difficulty: "normal" });
    expect(started).toEqual({ view: "playing", difficulty: "easy" });
  });

  it("pauses and resumes the same session without changing difficulty", () => {
    const playing = { view: "playing", difficulty: "normal" } as const;
    const paused = transitionPresentation(playing, { type: "pause" });

    expect(paused).toEqual({ view: "paused", difficulty: "normal" });
    expect(transitionPresentation(paused, { type: "resume" })).toEqual(playing);
  });

  it("restarts terminal and paused sessions and quits to the menu", () => {
    const paused = { view: "paused", difficulty: "easy" } as const;
    const won = transitionPresentation({ view: "playing", difficulty: "easy" }, { type: "gameWon" });
    const lost = transitionPresentation({ view: "playing", difficulty: "normal" }, { type: "gameLost" });

    expect(transitionPresentation(paused, { type: "restart" })).toEqual({ view: "playing", difficulty: "easy" });
    expect(transitionPresentation(won, { type: "restart" })).toEqual({ view: "playing", difficulty: "easy" });
    expect(transitionPresentation(lost, { type: "quitToMenu" })).toEqual({ view: "menu", difficulty: "normal" });
  });

  it("keeps invalid actions as no-ops", () => {
    const menu = createPresentationState();
    const won = { view: "won", difficulty: "normal" } as const;

    expect(transitionPresentation(menu, { type: "pause" })).toBe(menu);
    expect(transitionPresentation(won, { type: "pause" })).toBe(won);
    expect(transitionPresentation({ view: "playing", difficulty: "normal" }, { type: "selectDifficulty", difficulty: "easy" }))
      .toEqual({ view: "playing", difficulty: "normal" });
  });

  it("creates a clean selected-difficulty game for every restart", () => {
    const stale = createGameSession("normal");
    stale.score = 400;
    stale.lives = 1;
    stale.collectibles[0].collected = true;
    stale.player.x = 400;

    const fresh = createGameSession("easy");

    expect(fresh).not.toBe(stale);
    expect(fresh.config.difficulty).toBe("easy");
    expect(fresh.score).toBe(0);
    expect(fresh.lives).toBe(3);
    expect(fresh.player.x).toBe(64);
    expect(fresh.collectibles.every((collectible) => !collectible.collected)).toBe(true);
  });
});

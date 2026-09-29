import type { Difficulty } from "../game/types";

export type PresentationView = "menu" | "playing" | "paused" | "won" | "lost";

export type PresentationState = {
  view: PresentationView;
  difficulty: Difficulty;
};

export type PresentationAction =
  | { type: "selectDifficulty"; difficulty: Difficulty }
  | { type: "start" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "restart" }
  | { type: "quitToMenu" }
  | { type: "gameWon" }
  | { type: "gameLost" };

export const createPresentationState = (difficulty: Difficulty = "normal"): PresentationState => ({
  view: "menu",
  difficulty,
});

export function transitionPresentation(
  state: PresentationState,
  action: PresentationAction,
): PresentationState {
  switch (action.type) {
    case "selectDifficulty":
      return state.view === "menu" ? { ...state, difficulty: action.difficulty } : state;
    case "start":
      return state.view === "menu" ? { ...state, view: "playing" } : state;
    case "pause":
      return state.view === "playing" ? { ...state, view: "paused" } : state;
    case "resume":
      return state.view === "paused" ? { ...state, view: "playing" } : state;
    case "restart":
      return state.view === "paused" || state.view === "won" || state.view === "lost"
        ? { ...state, view: "playing" }
        : state;
    case "quitToMenu":
      return state.view === "paused" || state.view === "won" || state.view === "lost"
        ? { ...state, view: "menu" }
        : state;
    case "gameWon":
      return state.view === "playing" ? { ...state, view: "won" } : state;
    case "gameLost":
      return state.view === "playing" ? { ...state, view: "lost" } : state;
  }
}

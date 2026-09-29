import { DEFAULT_GAME_CONFIG } from "../game/config";
import { createInitialGameState } from "../game/rules";
import type { Difficulty } from "../game/types";

export const createGameSession = (difficulty: Difficulty) =>
  createInitialGameState({ ...DEFAULT_GAME_CONFIG, difficulty });

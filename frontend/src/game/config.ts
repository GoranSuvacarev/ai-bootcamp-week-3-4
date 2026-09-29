import type { GameConfig } from "./types";

export const DEFAULT_GAME_CONFIG: GameConfig = {
  levelWidth: 640,
  levelHeight: 900,
  lives: 3,
  playerSpeed: 180,
  jumpVelocity: 420,
  gravity: 1000,
  difficulty: "normal",
};

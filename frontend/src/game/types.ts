export type GamePhase = "ready" | "playing" | "won" | "lost";

export type Difficulty = "easy" | "normal";

export type DamageEvent = {
  cause: "hazard" | "enemy";
  x: number;
  y: number;
  time: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Rect = Point & Size;

export type Platform = Rect;

export type Ladder = Rect & {
  fromPlatformId: string;
  toPlatformId: string;
};

export type RollingHazard = Rect & {
  id: string;
  velocityX: number;
  active: boolean;
};

export type PatrolEnemy = Rect & {
  id: string;
  velocityX: number;
  patrolMinX: number;
  patrolMaxX: number;
};

export type Collectible = Rect & {
  id: string;
  points: number;
  collected: boolean;
};

export type Goal = Rect;

export type GameConfig = {
  levelWidth: number;
  levelHeight: number;
  lives: number;
  playerSpeed: number;
  jumpVelocity: number;
  gravity: number;
  difficulty: Difficulty;
};

export type PlayerState = Rect & {
  velocityX: number;
  velocityY: number;
  onGround: boolean;
  onLadder: boolean;
  invulnerableUntil: number;
};

export type GameState = {
  config: GameConfig;
  phase: GamePhase;
  time: number;
  score: number;
  lives: number;
  lastDamage: DamageEvent | null;
  player: PlayerState;
  platforms: Platform[];
  ladders: Ladder[];
  hazards: RollingHazard[];
  enemy: PatrolEnemy;
  collectibles: Collectible[];
  goal: Goal;
};

export type GameInput = {
  left: boolean;
  right: boolean;
  jump: boolean;
  climbUp: boolean;
  climbDown: boolean;
};

import { DEFAULT_GAME_CONFIG } from "./config";
import type { Difficulty, GameConfig } from "./types";

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult =
  | {
      valid: true;
      value: GameConfig;
      errors: [];
    }
  | {
      valid: false;
      value: GameConfig;
      errors: ValidationError[];
    };

const REQUIRED_FIELDS: Array<keyof GameConfig> = [
  "levelWidth",
  "levelHeight",
  "lives",
  "playerSpeed",
  "jumpVelocity",
  "gravity",
  "difficulty",
];

const isRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === "object" && input !== null;

const isDifficulty = (input: unknown): input is Difficulty =>
  input === "easy" || input === "normal";

export function validateGameConfig(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!isRecord(input)) {
    return {
      valid: false,
      value: DEFAULT_GAME_CONFIG,
      errors: [{ field: "config", message: "Configuration must be an object." }],
    };
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in input)) {
      errors.push({ field, message: "Required field is missing." });
    }
  }

  const numericFields: Array<keyof Omit<GameConfig, "difficulty">> = [
    "levelWidth",
    "levelHeight",
    "lives",
    "playerSpeed",
    "jumpVelocity",
    "gravity",
  ];

  for (const field of numericFields) {
    const value = input[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push({ field, message: "Value must be a finite number." });
    }
  }

  if (typeof input.levelWidth === "number" && Number.isFinite(input.levelWidth) && input.levelWidth <= 0) {
    errors.push({ field: "levelWidth", message: "Level width must be positive." });
  }

  if (typeof input.levelHeight === "number" && Number.isFinite(input.levelHeight) && input.levelHeight <= 0) {
    errors.push({ field: "levelHeight", message: "Level height must be positive." });
  }

  if (typeof input.lives === "number" && Number.isFinite(input.lives) && input.lives < 0) {
    errors.push({ field: "lives", message: "Lives cannot be negative." });
  }

  for (const field of ["playerSpeed", "jumpVelocity", "gravity"] as const) {
    const value = input[field];
    if (typeof value === "number" && Number.isFinite(value) && value <= 0) {
      errors.push({ field, message: "Movement values must be positive." });
    }
  }

  if (!isDifficulty(input.difficulty)) {
    errors.push({
      field: "difficulty",
      message: "Difficulty must be either easy or normal.",
    });
  }

  if (errors.length > 0) {
    return { valid: false, value: DEFAULT_GAME_CONFIG, errors };
  }

  return {
    valid: true,
    value: {
      levelWidth: input.levelWidth as number,
      levelHeight: input.levelHeight as number,
      lives: input.lives as number,
      playerSpeed: input.playerSpeed as number,
      jumpVelocity: input.jumpVelocity as number,
      gravity: input.gravity as number,
      difficulty: input.difficulty as Difficulty,
    },
    errors: [],
  };
}

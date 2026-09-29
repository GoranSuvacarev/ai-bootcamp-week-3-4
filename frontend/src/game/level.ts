import type { Collectible, Ladder, PatrolEnemy, Platform, RollingHazard } from "./types";

export const CORE_LEVEL_WIDTH = 640;
export const CORE_LEVEL_HEIGHT = 900;

export const CORE_PLATFORMS: Platform[] = [
  { x: 32, y: 840, width: 576, height: 20 },
  { x: 32, y: 680, width: 576, height: 20 },
  { x: 32, y: 520, width: 576, height: 20 },
  { x: 32, y: 360, width: 576, height: 20 },
  { x: 32, y: 200, width: 576, height: 20 },
];

export const CORE_LADDERS: Ladder[] = [
  { x: 544, y: 680, width: 32, height: 160, fromPlatformId: "platform-0", toPlatformId: "platform-1" },
  { x: 64, y: 520, width: 32, height: 160, fromPlatformId: "platform-1", toPlatformId: "platform-2" },
  { x: 544, y: 360, width: 32, height: 160, fromPlatformId: "platform-2", toPlatformId: "platform-3" },
  { x: 64, y: 200, width: 32, height: 160, fromPlatformId: "platform-3", toPlatformId: "platform-4" },
];

export const CORE_HAZARDS: RollingHazard[] = [
  {
    id: "hazard-01",
    x: 96,
    y: CORE_PLATFORMS[1].y - 24,
    width: 24,
    height: 24,
    velocityX: 120,
    active: true,
  },
];

export const CORE_ENEMY: PatrolEnemy = {
  id: "enemy-01",
  x: 160,
  y: CORE_PLATFORMS[3].y - 32,
  width: 32,
  height: 32,
  velocityX: 80,
  patrolMinX: 64,
  patrolMaxX: 368,
};

export const CORE_COLLECTIBLES: Collectible[] = [
  { id: "collectible-01", x: 160, y: CORE_PLATFORMS[1].y - 18, width: 18, height: 18, points: 100, collected: false },
  { id: "collectible-02", x: 450, y: CORE_PLATFORMS[2].y - 18, width: 18, height: 18, points: 100, collected: false },
  { id: "collectible-03", x: 480, y: CORE_PLATFORMS[4].y - 18, width: 18, height: 18, points: 100, collected: false },
];

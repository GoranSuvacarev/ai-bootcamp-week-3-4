import { DEFAULT_GAME_CONFIG } from "./config";
import {
  CORE_ENEMY,
  CORE_COLLECTIBLES,
  CORE_HAZARDS,
  CORE_LADDERS,
  CORE_PLATFORMS,
} from "./level";
import { validateGameConfig } from "./validation";
import type { GameConfig, GameInput, GameState, PlayerState } from "./types";

const PLAYER_SIZE = { width: 32, height: 40 };
const CLIMB_SPEED = 160;
const DIFFICULTY_RULES = {
  easy: {
    threatSpeedMultiplier: 0.65,
    invulnerabilityDuration: 1.5,
  },
  normal: {
    threatSpeedMultiplier: 1,
    invulnerabilityDuration: 1,
  },
} as const;
const EMPTY_INPUT: GameInput = {
  left: false,
  right: false,
  jump: false,
  climbUp: false,
  climbDown: false,
};

const copyPlatforms = () => CORE_PLATFORMS.map((platform) => ({ ...platform }));
const copyLadders = () => CORE_LADDERS.map((ladder) => ({ ...ladder }));
const copyHazards = () => CORE_HAZARDS.map((hazard) => ({ ...hazard }));
const copyEnemy = () => ({ ...CORE_ENEMY });
const copyCollectibles = () => CORE_COLLECTIBLES.map((collectible) => ({ ...collectible }));

const overlapsHorizontally = (left: { x: number; width: number }, right: { x: number; width: number }) =>
  left.x < right.x + right.width && left.x + left.width > right.x;

const overlaps = (left: { x: number; y: number; width: number; height: number }, right: { x: number; y: number; width: number; height: number }) =>
  left.x < right.x + right.width &&
  left.x + left.width > right.x &&
  left.y < right.y + right.height &&
  left.y + left.height > right.y;

const ladderBounds = (ladder: { y: number; height: number }, playerHeight: number) => ({
  topY: ladder.y - playerHeight,
  bottomY: ladder.y + ladder.height - playerHeight,
});

export function createInitialGameState(config: GameConfig = DEFAULT_GAME_CONFIG): GameState {
  const validated = validateGameConfig(config);
  const safeConfig = validated.value;

  return {
    config: { ...safeConfig },
    phase: "ready",
    time: 0,
    score: 0,
    lives: safeConfig.lives,
    lastDamage: null,
    player: {
      x: 64,
      y: CORE_PLATFORMS[0].y - PLAYER_SIZE.height,
      ...PLAYER_SIZE,
      velocityX: 0,
      velocityY: 0,
      onGround: true,
      onLadder: false,
      invulnerableUntil: 0,
    },
    platforms: copyPlatforms(),
    ladders: copyLadders(),
    hazards: copyHazards(),
    enemy: copyEnemy(),
    collectibles: copyCollectibles(),
    goal: { x: 544, y: 96, width: 64, height: 48 },
  };
}

export function updateGame(state: GameState, input: GameInput = EMPTY_INPUT, dt: number): GameState {
  if (state.phase === "won" || state.phase === "lost") {
    return state;
  }

  const safeDt = Number.isFinite(dt) && dt >= 0 ? dt : 0;
  const horizontalDirection = Number(input.right) - Number(input.left);
  const speed = state.config.playerSpeed;
  const gravity = state.config.gravity;
  const jumpVelocity = state.config.jumpVelocity;
  const maxX = state.config.levelWidth - state.player.width;
  const maxY = state.config.levelHeight - state.player.height;
  const difficultyRules = DIFFICULTY_RULES[state.config.difficulty];

  const player: PlayerState = {
    ...state.player,
    velocityX: horizontalDirection * speed,
  };

  const ladder = state.player.onLadder
    ? state.ladders.find((candidate) =>
        overlapsHorizontally(player, candidate) &&
        player.y + player.height >= candidate.y &&
        player.y <= candidate.y + candidate.height,
      )
    : state.ladders.find((candidate) => {
        if (!overlapsHorizontally(player, candidate) ||
          player.y + player.height < candidate.y ||
          player.y > candidate.y + candidate.height) {
          return false;
        }

        const { topY, bottomY } = ladderBounds(candidate, player.height);

        if (input.climbUp) {
          return player.y >= bottomY;
        }

        if (input.climbDown) {
          return player.y <= topY;
        }

        return false;
      });

  let enteredLadder = false;
  let movementHandledByLadder = false;

  if (!player.onLadder && player.onGround && ladder && (input.climbUp || input.climbDown)) {
    const { topY, bottomY } = ladderBounds(ladder, player.height);
    const canClimbUp = input.climbUp && player.y >= bottomY;
    const canClimbDown = input.climbDown && player.y <= topY;

    if (canClimbUp || canClimbDown) {
      player.onLadder = true;
      enteredLadder = true;
      player.velocityX = 0;
      player.velocityY = 0;
    }
  }

  if (player.onLadder && ladder) {
    movementHandledByLadder = true;
    player.velocityX = 0;
    player.velocityY = 0;
    player.onGround = false;

    if (input.climbUp) {
      player.y -= CLIMB_SPEED * safeDt;
    } else if (input.climbDown) {
      player.y += CLIMB_SPEED * safeDt;
    }

    const topY = ladder.y - player.height;
    const bottomY = ladder.y + ladder.height - player.height;

    if ((!enteredLadder || safeDt > 0) && player.y <= topY) {
      player.y = topY;
      player.onLadder = false;
      player.onGround = true;
    } else if ((!enteredLadder || safeDt > 0) && player.y >= bottomY) {
      player.y = bottomY;
      player.onLadder = false;
      player.onGround = true;
    }
  }

  if (!movementHandledByLadder) {
    if (input.jump && player.onGround) {
      player.velocityY = -jumpVelocity;
      player.onGround = false;
    }

    player.velocityY += gravity * safeDt;
    player.x = Math.min(maxX, Math.max(0, player.x + player.velocityX * safeDt));
    const previousBottom = player.y + player.height;
    const proposedY = player.y + player.velocityY * safeDt;
    player.y = proposedY;

    if (player.velocityY > 0) {
      const landingPlatform = state.platforms
        .filter((platform) =>
          overlapsHorizontally(player, platform) &&
          previousBottom <= platform.y &&
          player.y + player.height >= platform.y,
        )
        .sort((left, right) => left.y - right.y)[0];

      if (landingPlatform) {
        player.y = landingPlatform.y - player.height;
        player.velocityY = 0;
        player.onGround = true;
      }
    }

    if (!player.onGround && player.y >= maxY) {
      player.y = maxY;
      player.velocityY = 0;
      player.onGround = true;
    } else if (player.y <= 0) {
      player.y = 0;
      player.velocityY = 0;
      player.onGround = false;
    }
  }

  const hazards = state.hazards.map((hazard) => {
    if (!hazard.active) {
      return { ...hazard };
    }

    const hazardPlatform = CORE_PLATFORMS[1];
    const minX = hazardPlatform.x;
    const maxHazardX = hazardPlatform.x + hazardPlatform.width - hazard.width;
    const effectiveVelocityX = hazard.velocityX * difficultyRules.threatSpeedMultiplier;
    const nextX = hazard.x + effectiveVelocityX * safeDt;

    if (nextX < minX) {
      return { ...hazard, x: minX, velocityX: Math.abs(hazard.velocityX) };
    }
    if (nextX > maxHazardX) {
      return { ...hazard, x: maxHazardX, velocityX: -Math.abs(hazard.velocityX) };
    }
    return { ...hazard, x: nextX };
  });

  const enemyVelocityX = state.enemy.velocityX * difficultyRules.threatSpeedMultiplier;
  const nextEnemyX = state.enemy.x + enemyVelocityX * safeDt;
  const enemy = nextEnemyX < state.enemy.patrolMinX
    ? { ...state.enemy, x: state.enemy.patrolMinX, velocityX: Math.abs(state.enemy.velocityX) }
    : nextEnemyX > state.enemy.patrolMaxX
      ? { ...state.enemy, x: state.enemy.patrolMaxX, velocityX: -Math.abs(state.enemy.velocityX) }
      : { ...state.enemy, x: nextEnemyX };

  const nextTime = state.time + safeDt;
  const nextState: GameState = {
    ...state,
    phase: state.phase === "ready" ? "playing" : state.phase,
    time: nextTime,
    player,
    hazards,
    enemy,
  };

  const hazardHit = hazards.some((hazard) => hazard.active && overlaps(player, hazard));
  const enemyHit = overlaps(player, enemy);

  if ((hazardHit || enemyHit) && nextTime >= player.invulnerableUntil) {
    const remainingLives = state.lives - 1;
    const lastDamage = {
      cause: hazardHit ? "hazard" : "enemy",
      x: player.x,
      y: player.y,
      time: nextTime,
    } as const;

    if (remainingLives <= 0) {
      return {
        ...nextState,
        phase: "lost",
        lives: 0,
        lastDamage,
        player: { ...player, velocityX: 0, velocityY: 0 },
      };
    }

    return {
      ...nextState,
      lives: remainingLives,
      lastDamage,
      player: {
        ...player,
        x: 64,
        y: CORE_PLATFORMS[0].y - player.height,
        velocityX: 0,
        velocityY: 0,
        onGround: true,
        onLadder: false,
        invulnerableUntil: nextTime + difficultyRules.invulnerabilityDuration,
      },
    };
  }

  const collectibles = state.collectibles.map((collectible) =>
    !collectible.collected && overlaps(player, collectible)
      ? { ...collectible, collected: true }
      : { ...collectible },
  );
  const scoreDelta = collectibles.reduce(
    (total, collectible, index) =>
      collectible.collected && !state.collectibles[index].collected
        ? total + collectible.points
        : total,
    0,
  );
  const scoredState: GameState = {
    ...nextState,
    score: state.score + scoreDelta,
    collectibles,
  };

  if (overlaps(player, state.goal)) {
    return { ...scoredState, phase: "won" };
  }

  return scoredState;
}

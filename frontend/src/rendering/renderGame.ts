import type { GameState, Rect } from "../game/types";
import { CHARACTER_FRAMES, drawSprite, isLoaded, type GameAssets } from "./assets";

const colors = {
  ladder: "#f5bf58",
  text: "#f8f4e8",
  mutedText: "#b8cae7",
};

const drawRect = (context: CanvasRenderingContext2D, rect: Rect, color: string) => {
  context.fillStyle = color;
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
};

const drawBackdrop = (context: CanvasRenderingContext2D, assets: GameAssets) => {
  const { canvas } = context;
  const sky = context.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#081127");
  sky.addColorStop(0.48, "#142d50");
  sky.addColorStop(1, "#091225");
  context.fillStyle = sky;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const moonGlow = context.createRadialGradient(104, 112, 8, 104, 112, 66);
  moonGlow.addColorStop(0, "rgba(255, 239, 181, 0.9)");
  moonGlow.addColorStop(0.58, "rgba(255, 224, 148, 0.22)");
  moonGlow.addColorStop(1, "rgba(255, 224, 148, 0)");
  context.fillStyle = moonGlow;
  context.fillRect(38, 46, 132, 132);
  context.fillStyle = "#ffe7a6";
  context.beginPath();
  context.arc(104, 112, 34, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#dce8ff";
  for (const [x, y, size] of [
    [54, 64, 1], [184, 102, 2], [250, 68, 1], [328, 122, 1],
    [398, 76, 2], [486, 110, 1], [578, 72, 2], [612, 142, 1],
  ]) {
    context.fillRect(x, y, size, size);
  }

  context.save();
  context.globalAlpha = 0.46;
  const distantBuildings = [
    { image: assets.backdropCool, x: -26, y: 510 },
    { image: assets.backdropWarm, x: 68, y: 586 },
    { image: assets.backdropCool, x: 482, y: 578 },
    { image: assets.backdropWarm, x: 572, y: 500 },
  ];
  for (const building of distantBuildings) {
    if (isLoaded(building.image)) {
      context.drawImage(building.image, building.x, building.y, 96, 384);
    }
  }
  if (isLoaded(assets.antenna)) context.drawImage(assets.antenna, 568, 430, 54, 72);
  context.restore();

  const haze = context.createLinearGradient(0, 380, 0, canvas.height);
  haze.addColorStop(0, "rgba(6, 15, 34, 0)");
  haze.addColorStop(1, "rgba(4, 9, 22, 0.58)");
  context.fillStyle = haze;
  context.fillRect(0, 380, canvas.width, canvas.height - 380);
};

const drawPlatform = (context: CanvasRenderingContext2D, platform: Rect, assets: GameAssets) => {
  const hasRoofSet = isLoaded(assets.platformLeft) &&
    isLoaded(assets.platformMiddle) &&
    isLoaded(assets.platformRight);

  if (!hasRoofSet) {
    drawRect(context, platform, "#56607a");
    drawRect(context, { ...platform, height: 4 }, "#d7deef");
    return;
  }

  context.save();
  context.beginPath();
  context.rect(platform.x, platform.y, platform.width, 56);
  context.clip();
  context.drawImage(assets.platformLeft, platform.x, platform.y);
  for (let x = platform.x + 32; x < platform.x + platform.width - 96; x += 64) {
    context.drawImage(assets.platformMiddle, x, platform.y);
  }
  context.drawImage(assets.platformRight, platform.x + platform.width - 96, platform.y);
  context.restore();
  drawRect(context, { x: platform.x + 6, y: platform.y + 54, width: platform.width, height: 6 }, "rgba(2, 7, 18, 0.55)");
};

const drawHighRise = (context: CanvasRenderingContext2D, platforms: Rect[], assets: GameAssets) => {
  if (platforms.length === 0) return;
  const left = platforms[0].x;
  const width = platforms[0].width;
  const top = Math.min(...platforms.map((platform) => platform.y));
  const building = context.createLinearGradient(left, 0, left + width, 0);
  building.addColorStop(0, "#292c41");
  building.addColorStop(0.5, "#41465e");
  building.addColorStop(1, "#292c41");
  context.fillStyle = building;
  context.fillRect(left, top, width, context.canvas.height - top);

  drawRect(context, { x: left, y: top, width: 8, height: context.canvas.height - top }, "#171b30");
  drawRect(context, { x: left + width - 8, y: top, width: 8, height: context.canvas.height - top }, "#171b30");

  if (!isLoaded(assets.officeWindow)) return;
  context.save();
  context.globalAlpha = 0.82;
  for (const platform of platforms) {
    const windowY = platform.y + 76;
    for (let x = left + 12; x + 96 <= left + width; x += 112) {
      context.drawImage(assets.officeWindow, x, windowY, 96, 64);
    }
  }
  context.restore();
};

const drawLadder = (context: CanvasRenderingContext2D, ladder: Rect) => {
  context.save();
  context.shadowColor = "rgba(0, 0, 0, 0.7)";
  context.shadowOffsetX = 2;
  context.shadowOffsetY = 3;
  drawRect(context, { x: ladder.x + 5, y: ladder.y, width: 5, height: ladder.height }, colors.ladder);
  drawRect(context, { x: ladder.x + ladder.width - 10, y: ladder.y, width: 5, height: ladder.height }, colors.ladder);
  for (let y = ladder.y + 12; y < ladder.y + ladder.height; y += 20) {
    drawRect(context, { x: ladder.x + 7, y, width: ladder.width - 14, height: 4 }, colors.ladder);
  }
  context.restore();
};

const drawCollectible = (context: CanvasRenderingContext2D, collectible: Rect) => {
  drawRect(context, { x: collectible.x - 3, y: collectible.y - 3, width: 24, height: 24 }, "rgba(126, 224, 204, 0.18)");
  context.fillStyle = "#7de0cc";
  context.beginPath();
  context.moveTo(collectible.x + 9, collectible.y);
  context.lineTo(collectible.x + 18, collectible.y + 9);
  context.lineTo(collectible.x + 9, collectible.y + 18);
  context.lineTo(collectible.x, collectible.y + 9);
  context.closePath();
  context.fill();
  drawRect(context, { x: collectible.x + 7, y: collectible.y + 5, width: 4, height: 8 }, "#e9fffa");
};

const drawObjective = (context: CanvasRenderingContext2D, goal: Rect, assets: GameAssets, time: number) => {
  const pulse = 18 + Math.sin(time * 4) * 4;
  const centerX = goal.x + goal.width / 2;
  const centerY = goal.y + 10;
  const glow = context.createRadialGradient(centerX, centerY, 2, centerX, centerY, pulse);
  glow.addColorStop(0, "rgba(255, 102, 102, 0.9)");
  glow.addColorStop(1, "rgba(255, 71, 87, 0)");
  context.fillStyle = glow;
  context.fillRect(centerX - pulse, centerY - pulse, pulse * 2, pulse * 2);

  if (isLoaded(assets.signalBeacon)) {
    context.drawImage(assets.signalBeacon, goal.x + 4, goal.y - 16, 32, 64);
  } else {
    drawRect(context, { x: goal.x + 12, y: goal.y + 10, width: 16, height: 38 }, "#ff5d6c");
  }

  context.fillStyle = "rgba(7, 13, 28, 0.9)";
  context.fillRect(goal.x - 68, goal.y - 31, 108, 18);
  context.fillStyle = "#ffadb5";
  context.font = "700 10px system-ui, sans-serif";
  context.fillText("SECURE BEACON", goal.x - 60, goal.y - 18);
};

export function renderGame(context: CanvasRenderingContext2D, state: GameState, assets: GameAssets): void {
  const { canvas } = context;
  context.imageSmoothingEnabled = false;
  drawBackdrop(context, assets);
  drawHighRise(context, state.platforms, assets);

  context.fillStyle = colors.text;
  context.font = "700 16px system-ui, sans-serif";
  context.fillText("QUATTRO KONG // NIGHT SHIFT", 28, 38);
  context.fillStyle = colors.mutedText;
  context.font = "600 11px system-ui, sans-serif";
  context.fillText("RECOVER THE ROOFTOP BEACON", 28, 58);

  state.platforms.forEach((platform) => drawPlatform(context, platform, assets));
  for (const ladder of state.ladders) drawLadder(context, ladder);
  for (const collectible of state.collectibles) {
    if (!collectible.collected) drawCollectible(context, collectible);
  }
  for (const hazard of state.hazards) {
    if (hazard.active) drawSprite(context, assets.cyclops, CHARACTER_FRAMES.cyclopsIdle, hazard);
  }
  drawSprite(context, assets.zombie, CHARACTER_FRAMES.zombieIdle, {
    x: state.enemy.x,
    y: state.enemy.y + state.enemy.height - CHARACTER_FRAMES.zombieIdle.height,
    width: CHARACTER_FRAMES.zombieIdle.width,
    height: CHARACTER_FRAMES.zombieIdle.height,
  });
  drawObjective(context, state.goal, assets, state.time);

  const scoutFrame = CHARACTER_FRAMES.scout[state.player.facing];
  drawSprite(context, assets.scout, scoutFrame, {
    x: state.player.x,
    y: state.player.y + state.player.height - scoutFrame.height,
    width: scoutFrame.width,
    height: scoutFrame.height,
  });
  if (state.player.invulnerableUntil > state.time) {
    context.strokeStyle = "#ffe58a";
    context.lineWidth = 2;
    context.strokeRect(state.player.x - 2, state.player.y - 2, state.player.width + 4, state.player.height + 4);
  }

  drawRect(context, { x: 0, y: canvas.height - 30, width: canvas.width, height: 30 }, "rgba(8, 15, 30, 0.82)");
  context.fillStyle = colors.mutedText;
  context.font = "700 11px system-ui, sans-serif";
  context.fillText("ZOMBIE PATROL + CYCLOPS DRONE ACTIVE", 24, canvas.height - 11);
}

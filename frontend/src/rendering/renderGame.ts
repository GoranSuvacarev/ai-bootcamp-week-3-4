import type { GameState, Rect } from "../game/types";
import { CHARACTER_FRAMES, drawSprite, isLoaded, type GameAssets } from "./assets";

const colors = { platform: "#293653", edge: "#92afd1", ladder: "#f5bf58", text: "#f8f4e8", glow: "#f7c968" };

const drawRect = (context: CanvasRenderingContext2D, rect: Rect, color: string) => {
  context.fillStyle = color;
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
};

const drawBackdrop = (context: CanvasRenderingContext2D, assets: GameAssets) => {
  const { canvas } = context;
  const sky = context.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#10172f");
  sky.addColorStop(0.54, "#263f6e");
  sky.addColorStop(1, "#10172f");
  context.fillStyle = sky;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(247, 201, 104, 0.17)";
  context.beginPath();
  context.arc(506, 116, 72, 0, Math.PI * 2);
  context.fill();

  context.save();
  context.globalAlpha = 0.27;
  if (isLoaded(assets.buildings)) context.drawImage(assets.buildings, 0, 0, 1024, 1640, 0, 104, canvas.width, 714);
  if (isLoaded(assets.floors)) context.drawImage(assets.floors, 0, 210, 1024, 920, 0, 276, canvas.width, 576);
  context.restore();

  context.fillStyle = "rgba(8, 15, 30, 0.3)";
  for (let y = 156; y < canvas.height; y += 160) context.fillRect(0, y, canvas.width, 2);
};

const drawPlatform = (context: CanvasRenderingContext2D, platform: Rect, assets: GameAssets) => {
  drawRect(context, { ...platform, x: platform.x + 4, y: platform.y + 6, height: platform.height + 7 }, "rgba(6, 10, 23, 0.58)");
  drawRect(context, platform, colors.platform);
  drawRect(context, { ...platform, height: 4 }, colors.edge);
  if (!isLoaded(assets.city)) return;
  context.save();
  context.globalAlpha = 0.72;
  for (let x = platform.x; x < platform.x + platform.width; x += 64) {
    context.drawImage(assets.city, 0, 0, 64, 32, x, platform.y - 8, Math.min(64, platform.x + platform.width - x), 20);
  }
  context.restore();
};

const drawLadder = (context: CanvasRenderingContext2D, ladder: Rect, assets: GameAssets) => {
  context.strokeStyle = "rgba(5, 10, 20, 0.6)";
  context.lineWidth = 8;
  context.beginPath();
  context.moveTo(ladder.x + 5, ladder.y + 4); context.lineTo(ladder.x + 5, ladder.y + ladder.height);
  context.moveTo(ladder.x + ladder.width - 5, ladder.y + 4); context.lineTo(ladder.x + ladder.width - 5, ladder.y + ladder.height);
  context.stroke();
  context.strokeStyle = colors.ladder;
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(ladder.x + 5, ladder.y + 4); context.lineTo(ladder.x + 5, ladder.y + ladder.height);
  context.moveTo(ladder.x + ladder.width - 5, ladder.y + 4); context.lineTo(ladder.x + ladder.width - 5, ladder.y + ladder.height);
  for (let y = ladder.y + 12; y < ladder.y + ladder.height; y += 20) {
    context.moveTo(ladder.x + 5, y); context.lineTo(ladder.x + ladder.width - 5, y);
  }
  context.stroke();
  if (isLoaded(assets.terrain)) {
    context.save(); context.globalAlpha = 0.16;
    context.drawImage(assets.terrain, 0, 0, 192, 576, ladder.x - 16, ladder.y, 64, ladder.height);
    context.restore();
  }
};

const drawGoal = (context: CanvasRenderingContext2D, goal: Rect, assets: GameAssets) => {
  drawRect(context, { x: goal.x - 7, y: goal.y - 10, width: goal.width + 14, height: goal.height + 10 }, "#182445");
  drawRect(context, { x: goal.x + 9, y: goal.y + 2, width: 4, height: goal.height - 2 }, colors.glow);
  context.fillStyle = colors.glow;
  context.beginPath();
  context.moveTo(goal.x + 13, goal.y + 3); context.lineTo(goal.x + goal.width - 2, goal.y + 12); context.lineTo(goal.x + 13, goal.y + 23);
  context.closePath(); context.fill();
  if (isLoaded(assets.props)) {
    context.save(); context.globalAlpha = 0.42;
    context.drawImage(assets.props, 0, 0, 224, 224, goal.x - 10, goal.y - 46, 80, 80);
    context.restore();
  }
  context.fillStyle = colors.text; context.font = "700 12px system-ui, sans-serif";
  context.fillText("SAFEHOUSE", goal.x - 4, goal.y - 18);
};

export function renderGame(context: CanvasRenderingContext2D, state: GameState, assets: GameAssets): void {
  const { canvas } = context;
  context.imageSmoothingEnabled = false;
  drawBackdrop(context, assets);
  context.fillStyle = colors.text; context.font = "700 16px system-ui, sans-serif";
  context.fillText("QUATTRO KONG // NIGHT SHIFT", 28, 38);
  context.fillStyle = "#b8cae7"; context.font = "600 11px system-ui, sans-serif";
  context.fillText("CLIMB TO THE SAFEHOUSE", 28, 58);
  for (const platform of state.platforms) drawPlatform(context, platform, assets);
  for (const ladder of state.ladders) drawLadder(context, ladder, assets);
  for (const collectible of state.collectibles) {
    if (!collectible.collected) {
      context.fillStyle = "rgba(255, 218, 103, 0.25)"; context.beginPath(); context.arc(collectible.x + 9, collectible.y + 9, 14, 0, Math.PI * 2); context.fill();
      context.fillStyle = "#ffe58a"; context.beginPath(); context.arc(collectible.x + 9, collectible.y + 9, 7, 0, Math.PI * 2); context.fill();
    }
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
  drawGoal(context, state.goal, assets);
  drawSprite(context, assets.scout, CHARACTER_FRAMES.scoutIdle, {
    x: state.player.x,
    y: state.player.y + state.player.height - CHARACTER_FRAMES.scoutIdle.height,
    width: CHARACTER_FRAMES.scoutIdle.width,
    height: CHARACTER_FRAMES.scoutIdle.height,
  });
  if (state.player.invulnerableUntil > state.time) {
    context.strokeStyle = "#ffe58a"; context.lineWidth = 2;
    context.strokeRect(state.player.x - 2, state.player.y - 2, state.player.width + 4, state.player.height + 4);
  }
  drawRect(context, { x: 0, y: canvas.height - 30, width: canvas.width, height: 30 }, "rgba(8, 15, 30, 0.76)");
  context.fillStyle = "#b8cae7"; context.font = "700 11px system-ui, sans-serif";
  context.fillText("ZOMBIE PATROL + CYCLOPS DRONE ACTIVE", 24, canvas.height - 11);
}

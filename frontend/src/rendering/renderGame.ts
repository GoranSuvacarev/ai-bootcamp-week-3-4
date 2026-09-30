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
  sky.addColorStop(0, "#09142c");
  sky.addColorStop(0.52, "#17345a");
  sky.addColorStop(1, "#0b1428");
  context.fillStyle = sky;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255, 239, 181, 0.84)";
  context.beginPath();
  context.arc(520, 104, 45, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#dce8ff";
  for (const [x, y] of [[74, 92], [138, 128], [218, 78], [316, 114], [406, 68], [584, 82]]) {
    context.fillRect(x, y, 2, 2);
  }

  context.save();
  context.globalAlpha = 0.72;
  const facades = [assets.backdropCool, assets.backdropWarm];
  for (let x = -20, index = 0; x < canvas.width; x += 92, index += 1) {
    const facade = facades[index % facades.length];
    if (isLoaded(facade)) context.drawImage(facade, x, 438, 96, 384);
  }
  if (isLoaded(assets.backdropWindows)) {
    for (let x = 40; x < canvas.width; x += 160) context.drawImage(assets.backdropWindows, x, 366, 160, 64);
  }
  if (isLoaded(assets.antenna)) context.drawImage(assets.antenna, 438, 278, 72, 96);
  context.restore();

  context.fillStyle = "rgba(5, 12, 28, 0.42)";
  context.fillRect(0, 330, canvas.width, 520);
};

const drawPlatform = (context: CanvasRenderingContext2D, platform: Rect, assets: GameAssets, index: number) => {
  drawRect(context, { ...platform, x: platform.x + 5, y: platform.y + 7, height: platform.height + 9 }, "rgba(2, 7, 18, 0.72)");
  drawRect(context, platform, "#1c2942");
  const panel = index % 2 === 0 ? assets.roofSlate : assets.roofTeal;
  if (!isLoaded(panel)) return;
  context.save();
  context.beginPath();
  context.rect(platform.x, platform.y - 8, platform.width, 34);
  context.clip();
  for (let x = platform.x; x < platform.x + platform.width; x += 112) {
    context.drawImage(panel, x, platform.y - 12, 112, 96);
  }
  context.restore();
  drawRect(context, { ...platform, y: platform.y - 2, height: 4 }, colors.edge);
};

const drawLadder = (context: CanvasRenderingContext2D, ladder: Rect) => {
  drawRect(context, { x: ladder.x + 3, y: ladder.y, width: 7, height: ladder.height }, "#533f34");
  drawRect(context, { x: ladder.x + ladder.width - 10, y: ladder.y, width: 7, height: ladder.height }, "#533f34");
  drawRect(context, { x: ladder.x + 5, y: ladder.y, width: 4, height: ladder.height }, colors.ladder);
  drawRect(context, { x: ladder.x + ladder.width - 9, y: ladder.y, width: 4, height: ladder.height }, colors.ladder);
  for (let y = ladder.y + 12; y < ladder.y + ladder.height; y += 20) {
    drawRect(context, { x: ladder.x + 7, y, width: ladder.width - 14, height: 4 }, colors.ladder);
  }
};

const drawGoal = (context: CanvasRenderingContext2D, goal: Rect, assets: GameAssets) => {
  if (isLoaded(assets.safehouse)) context.drawImage(assets.safehouse, goal.x - 56, goal.y - 78, 128, 128);
  if (isLoaded(assets.dangerSign)) context.drawImage(assets.dangerSign, goal.x - 18, goal.y - 42, 24, 24);
  context.fillStyle = "rgba(7, 13, 28, 0.88)";
  context.fillRect(goal.x - 48, goal.y - 84, 112, 18);
  context.fillStyle = colors.text; context.font = "700 11px system-ui, sans-serif";
  context.fillText("SAFEHOUSE", goal.x - 38, goal.y - 71);
};

export function renderGame(context: CanvasRenderingContext2D, state: GameState, assets: GameAssets): void {
  const { canvas } = context;
  context.imageSmoothingEnabled = false;
  drawBackdrop(context, assets);
  context.fillStyle = colors.text; context.font = "700 16px system-ui, sans-serif";
  context.fillText("QUATTRO KONG // NIGHT SHIFT", 28, 38);
  context.fillStyle = "#b8cae7"; context.font = "600 11px system-ui, sans-serif";
  context.fillText("CLIMB TO THE SAFEHOUSE", 28, 58);
  state.platforms.forEach((platform, index) => drawPlatform(context, platform, assets, index));
  for (const ladder of state.ladders) drawLadder(context, ladder);
  for (const collectible of state.collectibles) {
    if (!collectible.collected) {
      drawRect(context, { x: collectible.x - 3, y: collectible.y - 3, width: 24, height: 24 }, "rgba(126, 224, 204, 0.18)");
      context.fillStyle = "#7de0cc";
      context.beginPath();
      context.moveTo(collectible.x + 9, collectible.y);
      context.lineTo(collectible.x + 18, collectible.y + 9);
      context.lineTo(collectible.x + 9, collectible.y + 18);
      context.lineTo(collectible.x, collectible.y + 9);
      context.closePath(); context.fill();
      drawRect(context, { x: collectible.x + 7, y: collectible.y + 5, width: 4, height: 8 }, "#e9fffa");
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

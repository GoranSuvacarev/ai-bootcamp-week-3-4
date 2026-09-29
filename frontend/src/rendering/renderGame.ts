import type { GameState, Rect } from "../game/types";

const colors = {
  background: "#17152a",
  grid: "#211d3b",
  platform: "#5b4b8a",
  ladder: "#f4d35e",
  player: "#ff6b6b",
  hazard: "#fb923c",
  enemy: "#c084fc",
  collectible: "#facc15",
  goal: "#6ee7b7",
  text: "#f7f3e3",
  muted: "#b8b4d9",
};

const drawRect = (context: CanvasRenderingContext2D, rect: Rect, color: string) => {
  context.fillStyle = color;
  context.fillRect(rect.x, rect.y, rect.width, rect.height);
};

const drawLadder = (context: CanvasRenderingContext2D, ladder: Rect) => {
  context.strokeStyle = colors.ladder;
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(ladder.x + 5, ladder.y);
  context.lineTo(ladder.x + 5, ladder.y + ladder.height);
  context.moveTo(ladder.x + ladder.width - 5, ladder.y);
  context.lineTo(ladder.x + ladder.width - 5, ladder.y + ladder.height);
  for (let y = ladder.y + 8; y < ladder.y + ladder.height; y += 18) {
    context.moveTo(ladder.x + 4, y);
    context.lineTo(ladder.x + ladder.width - 4, y);
  }
  context.stroke();
};

const drawCircle = (context: CanvasRenderingContext2D, rect: Rect, color: string) => {
  context.fillStyle = color;
  context.beginPath();
  context.arc(rect.x + rect.width / 2, rect.y + rect.height / 2, Math.min(rect.width, rect.height) / 2, 0, Math.PI * 2);
  context.fill();
};

export function renderGame(context: CanvasRenderingContext2D, state: GameState): void {
  const { canvas } = context;
  context.fillStyle = colors.background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = colors.grid;
  for (let y = 40; y < canvas.height; y += 180) {
    context.fillRect(0, y, canvas.width, 4);
  }

  context.fillStyle = colors.text;
  context.font = "bold 28px system-ui, sans-serif";
  context.fillText("ROOFTOP RUN", 32, 50);

  context.font = "bold 16px system-ui, sans-serif";
  context.fillText(`SCORE ${String(state.score).padStart(4, "0")}`, 32, 78);
  context.fillText(`LIVES ${String(state.lives).padStart(2, "0")}`, 150, 78);

  for (const platform of state.platforms) {
    drawRect(context, platform, colors.platform);
  }

  for (const ladder of state.ladders) {
    drawLadder(context, ladder);
  }

  for (const hazard of state.hazards) {
    if (hazard.active) {
      drawCircle(context, hazard, colors.hazard);
    }
  }

  drawRect(context, state.enemy, colors.enemy);

  for (const collectible of state.collectibles) {
    if (!collectible.collected) {
      drawCircle(context, collectible, colors.collectible);
    }
  }

  drawRect(context, state.goal, colors.goal);
  context.fillStyle = colors.muted;
  context.font = "bold 14px system-ui, sans-serif";
  context.fillText("GOAL", state.goal.x + 8, state.goal.y - 10);

  drawRect(context, state.player, colors.player);
  context.fillStyle = colors.text;
  context.font = "18px system-ui, sans-serif";
  context.fillText(`PHASE: ${state.phase.toUpperCase()}`, 32, canvas.height - 36);
}

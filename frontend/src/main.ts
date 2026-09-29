import { DEFAULT_GAME_CONFIG } from "./game/config";
import { createInitialGameState, updateGame } from "./game/rules";
import { createKeyboardControls } from "./input/controls";
import { renderGame } from "./rendering/renderGame";

const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");

if (!canvas) {
  throw new Error("The game canvas mount is missing.");
}

const context = canvas.getContext("2d");

if (!context) {
  throw new Error("The browser does not provide a 2D canvas context.");
}

const controls = createKeyboardControls();
let state = createInitialGameState();
let previousTime: number | undefined;

const scoreElement = document.querySelector<HTMLElement>("#score-value");
const livesElement = document.querySelector<HTMLElement>("#lives-value");
const phaseElement = document.querySelector<HTMLElement>("#phase-label");
const difficultyInputs = document.querySelectorAll<HTMLInputElement>('input[name="difficulty"]');
const hintButton = document.querySelector<HTMLButtonElement>("#hint-button");
const hintMessage = document.querySelector<HTMLElement>("#hint-message");
let displayedDamage = state.lastDamage;
let hintRequest: AbortController | null = null;

const updateHud = () => {
  if (scoreElement) {
    scoreElement.textContent = String(state.score).padStart(4, "0");
  }
  if (livesElement) {
    livesElement.textContent = String(state.lives).padStart(2, "0");
  }
  if (phaseElement) {
    phaseElement.textContent = `Phase: ${state.phase}`;
  }
  if (state.lastDamage !== displayedDamage) {
    displayedDamage = state.lastDamage;
    hintRequest?.abort();
    hintRequest = null;
    if (hintMessage) {
      hintMessage.textContent = state.lastDamage ? "" : "Available after losing a life.";
    }
  }
  if (hintButton) {
    hintButton.disabled = !state.lastDamage || hintRequest !== null;
  }
};

hintButton?.addEventListener("click", async () => {
  const damage = state.lastDamage;
  if (!damage || hintRequest) return;

  const controller = new AbortController();
  hintRequest = controller;
  if (hintMessage) hintMessage.textContent = "Thinking...";
  updateHud();

  try {
    const response = await fetch("/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty: state.config.difficulty,
        lives: state.lives,
        lastDamage: damage,
      }),
      signal: controller.signal,
    });
    const result = await response.json() as { hint?: string; error?: { message?: string } };
    if (!response.ok || !result.hint) {
      throw new Error(result.error?.message ?? "Could not get a hint. Try again.");
    }
    if (state.lastDamage === damage && hintMessage) hintMessage.textContent = result.hint;
  } catch (error) {
    if (!controller.signal.aborted && state.lastDamage === damage && hintMessage) {
      hintMessage.textContent = error instanceof Error ? error.message : "Could not get a hint. Try again.";
    }
  } finally {
    if (hintRequest === controller) {
      hintRequest = null;
      updateHud();
    }
  }
});

for (const input of difficultyInputs) {
  input.addEventListener("change", () => {
    if (!input.checked) {
      return;
    }

    const difficulty = input.value === "easy" ? "easy" : "normal";
    state = createInitialGameState({ ...DEFAULT_GAME_CONFIG, difficulty });
    previousTime = undefined;
    controls.reset();
    renderGame(context, state);
    updateHud();
  });
}

const frame = (timestamp: number) => {
  const elapsed = previousTime === undefined ? 0 : (timestamp - previousTime) / 1000;
  previousTime = timestamp;
  state = updateGame(state, controls.getInput(), Math.min(elapsed, 0.05));
  renderGame(context, state);
  updateHud();
  requestAnimationFrame(frame);
};

renderGame(context, state);
updateHud();
requestAnimationFrame(frame);

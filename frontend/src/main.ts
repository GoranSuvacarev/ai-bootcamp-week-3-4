import "./styles.css";
import { createInitialGameState, updateGame } from "./game/rules";
import { createKeyboardControls } from "./input/controls";
import { createGameSession } from "./presentation/gameSession";
import { createPresentationState, transitionPresentation, type PresentationAction } from "./presentation/session";
import { canDisplayHint, COACH_UNAVAILABLE_MESSAGE, hintMessageFromResult } from "./coach/hintFeedback";
import { createGameAssets } from "./rendering/assets";
import { renderGame } from "./rendering/renderGame";

const requireElement = <T extends Element>(selector: string) => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`The ${selector} mount is missing.`);
  return element;
};

const canvas = requireElement<HTMLCanvasElement>("#game-canvas");
const context = canvas.getContext("2d");
if (!context) throw new Error("The browser does not provide a 2D canvas context.");

const menuPanel = requireElement<HTMLElement>("#menu-panel");
const pausePanel = requireElement<HTMLElement>("#pause-panel");
const outcomePanel = requireElement<HTMLElement>("#outcome-panel");
const outcomeKicker = requireElement<HTMLElement>("#outcome-kicker");
const outcomeTitle = requireElement<HTMLElement>("#outcome-title");
const outcomeCopy = requireElement<HTMLElement>("#outcome-copy");
const startButton = requireElement<HTMLButtonElement>("#start-button");
const pauseButton = requireElement<HTMLButtonElement>("#pause-button");
const resumeButton = requireElement<HTMLButtonElement>("#resume-button");
const restartButton = requireElement<HTMLButtonElement>("#restart-button");
const quitButton = requireElement<HTMLButtonElement>("#quit-button");
const outcomeRestartButton = requireElement<HTMLButtonElement>("#outcome-restart-button");
const outcomeMenuButton = requireElement<HTMLButtonElement>("#outcome-menu-button");
const scoreElement = requireElement<HTMLElement>("#score-value");
const livesElement = requireElement<HTMLElement>("#lives-value");
const timeElement = requireElement<HTMLElement>("#time-value");
const phaseElement = requireElement<HTMLElement>("#phase-label");
const coachControl = requireElement<HTMLElement>("#coach-control");
const hintButton = requireElement<HTMLButtonElement>("#hint-button");
const hintMessage = requireElement<HTMLElement>("#hint-message");
const difficultyInputs = document.querySelectorAll<HTMLInputElement>('input[name="difficulty"]');

const controls = createKeyboardControls();
const assets = createGameAssets();
let presentation = createPresentationState();
let state = createInitialGameState();
let previousTime: number | undefined;
let displayedDamage = state.lastDamage;
let hintRequest: AbortController | null = null;

const createSession = () => createGameSession(presentation.difficulty);
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;

const stopHintRequest = () => {
  hintRequest?.abort();
  hintRequest = null;
};

const updateHud = () => {
  scoreElement.textContent = String(state.score).padStart(4, "0");
  livesElement.textContent = String(state.lives).padStart(2, "0");
  timeElement.textContent = formatTime(state.time);
  phaseElement.textContent = presentation.view === "menu" ? "Main menu" : `Session: ${presentation.view}`;
  pauseButton.hidden = presentation.view !== "playing";
  coachControl.hidden = presentation.view !== "playing";

  if (state.lastDamage !== displayedDamage) {
    displayedDamage = state.lastDamage;
    stopHintRequest();
  }
  if (!state.lastDamage) hintMessage.textContent = "Available after losing a life.";
  hintButton.disabled = presentation.view !== "playing" || !state.lastDamage || hintRequest !== null;
};

const updatePanels = () => {
  menuPanel.hidden = presentation.view !== "menu";
  pausePanel.hidden = presentation.view !== "paused";
  outcomePanel.hidden = presentation.view !== "won" && presentation.view !== "lost";
  if (presentation.view === "won") {
    outcomeKicker.textContent = "Route complete";
    outcomeTitle.textContent = "Beacon secured";
    outcomeCopy.textContent = "The emergency signal is recovered. Run the route again to improve your score.";
  } else if (presentation.view === "lost") {
    outcomeKicker.textContent = "Signal lost";
    outcomeTitle.textContent = "Night shift over";
    outcomeCopy.textContent = "The patrol caught you. Reset the route and try a different climb.";
  }
  for (const input of difficultyInputs) input.checked = input.value === presentation.difficulty;
};

const applyAction = (action: PresentationAction) => {
  const previous = presentation;
  const next = transitionPresentation(previous, action);
  if (next === previous) return;
  presentation = next;
  const startsFreshSession = action.type === "start" || action.type === "restart";
  const endsSession = action.type === "quitToMenu" || action.type === "gameWon" || action.type === "gameLost";

  if (startsFreshSession) state = createSession();
  if (action.type === "quitToMenu") state = createSession();
  if (startsFreshSession || previous.view === "playing" || next.view === "playing") {
    controls.reset();
    previousTime = undefined;
  }
  if (startsFreshSession || endsSession) {
    stopHintRequest();
    displayedDamage = state.lastDamage;
    hintMessage.textContent = "Available after losing a life.";
  }
  updatePanels();
  updateHud();
};

hintButton.addEventListener("click", async () => {
  const damage = state.lastDamage;
  if (!damage || hintRequest || presentation.view !== "playing") return;
  const controller = new AbortController();
  hintRequest = controller;
  hintMessage.textContent = "Thinking…";
  updateHud();
  try {
    const response = await fetch("/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty: state.config.difficulty, lives: state.lives, lastDamage: damage }),
      signal: controller.signal,
    });
    const result: unknown = await response.json();
    if (canDisplayHint(controller, hintRequest, damage, state.lastDamage, presentation.view)) {
      hintMessage.textContent = hintMessageFromResult(result, response.ok);
    }
  } catch {
    if (canDisplayHint(controller, hintRequest, damage, state.lastDamage, presentation.view)) {
      hintMessage.textContent = COACH_UNAVAILABLE_MESSAGE;
    }
  } finally {
    if (hintRequest === controller) { hintRequest = null; updateHud(); }
  }
});

for (const input of difficultyInputs) input.addEventListener("change", () => {
  if (input.checked) applyAction({ type: "selectDifficulty", difficulty: input.value === "easy" ? "easy" : "normal" });
});
startButton.addEventListener("click", () => applyAction({ type: "start" }));
pauseButton.addEventListener("click", () => applyAction({ type: "pause" }));
resumeButton.addEventListener("click", () => applyAction({ type: "resume" }));
restartButton.addEventListener("click", () => applyAction({ type: "restart" }));
quitButton.addEventListener("click", () => applyAction({ type: "quitToMenu" }));
outcomeRestartButton.addEventListener("click", () => applyAction({ type: "restart" }));
outcomeMenuButton.addEventListener("click", () => applyAction({ type: "quitToMenu" }));

window.addEventListener("keydown", (event) => {
  if (event.target instanceof Element && event.target.closest("input, button, select, textarea, [contenteditable]")) return;
  if (event.code === "Escape") {
    if (presentation.view === "playing") applyAction({ type: "pause" });
    else if (presentation.view === "paused") applyAction({ type: "resume" });
    event.preventDefault();
  }
});

const frame = (timestamp: number) => {
  if (presentation.view === "playing") {
    const elapsed = previousTime === undefined ? 0 : Math.min((timestamp - previousTime) / 1000, 0.05);
    previousTime = timestamp;
    state = updateGame(state, controls.getInput(), elapsed);
    if (state.phase === "won") applyAction({ type: "gameWon" });
    if (state.phase === "lost") applyAction({ type: "gameLost" });
  } else {
    previousTime = undefined;
  }
  renderGame(context, state, assets);
  updateHud();
  requestAnimationFrame(frame);
};

updatePanels();
updateHud();
renderGame(context, state, assets);
requestAnimationFrame(frame);

import type { GameInput } from "../game/types";

type ControlAction = keyof GameInput;

const KEY_ACTIONS: Record<string, ControlAction> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  Space: "jump",
  ArrowUp: "climbUp",
  KeyW: "climbUp",
  ArrowDown: "climbDown",
  KeyS: "climbDown",
};

const emptyInput = (): GameInput => ({
  left: false,
  right: false,
  jump: false,
  climbUp: false,
  climbDown: false,
});

export function createKeyboardControls(target: Window = window) {
  let input = emptyInput();

  const setKeyState = (event: KeyboardEvent, pressed: boolean) => {
    const action = KEY_ACTIONS[event.code];
    if (!action) {
      return;
    }

    if (event.target instanceof Element && event.target.closest("input, button, select, textarea, [contenteditable]")) {
      input = { ...input, [action]: false };
      return;
    }

    input = { ...input, [action]: pressed };
    event.preventDefault();
  };

  const handleKeyDown = (event: KeyboardEvent) => setKeyState(event, true);
  const handleKeyUp = (event: KeyboardEvent) => setKeyState(event, false);

  target.addEventListener("keydown", handleKeyDown);
  target.addEventListener("keyup", handleKeyUp);

  return {
    getInput: (): GameInput => ({ ...input }),
    reset: () => { input = emptyInput(); },
    dispose: () => {
      target.removeEventListener("keydown", handleKeyDown);
      target.removeEventListener("keyup", handleKeyUp);
    },
  };
}

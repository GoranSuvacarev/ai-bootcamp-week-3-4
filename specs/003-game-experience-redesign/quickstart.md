# Quickstart: Game Experience Redesign

## Prerequisites

- Node.js and npm installed.
- Dependencies installed from the repository root:

  ```powershell
  npm.cmd install
  ```

## Automated checks

Run from the repository root:

```powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
```

The Feature 003 check adds pure presentation-state tests to the existing frontend
game and evaluation suite.

## Manual browser smoke test

1. Start the combined workspace development command:

   ```powershell
   npm.cmd run dev -- --host 127.0.0.1
   ```

2. Open the Vite URL shown in the terminal.
3. On the main menu, verify the objective, controls, difficulty choices, focus
   treatment, and Start Game action.
4. Start on each difficulty. During play, pause and verify the player and visible
   game time remain fixed; resume and verify no movement jump occurs.
5. In separate runs, use Restart and Quit Game from the pause panel. Confirm restart
   resets score/lives/collectibles and quit returns to the menu.
6. Exercise win and loss fixtures or deterministic setup, then verify their distinct
   result panels, Restart, and Main Menu actions.
7. Repeat the menu and active-game checks with a narrow browser width. Primary
   controls and HUD values must remain visible and usable.

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

## Implementation evidence

**Baseline before the redesign**: the separated workspace passed 56 tests: 48 in
the frontend, five in the backend, and three in game contracts. The deterministic
evaluation cases E1–E4 passed.

**Controlled changes**: added the pure presentation-state controller, the licensed
tile-art renderer, the accessible menu/pause/outcome controls, and changed the
combined dev runner to start Vite with `frontend/` as its working directory.

**Observed baseline problem and hypothesis**: `scripts/dev.mjs` printed a Vite URL,
but the frontend returned HTTP 404 because Vite inherited the repository-root working
directory, which contains no `index.html`. Starting Vite from `frontend/` should serve
the browser application while retaining the backend proxy.

**After the change**: all four deterministic E1–E4 cases still pass within the
frontend test suite. The complete workspace passes 61 tests (53 frontend, five
backend, and three contracts), typecheck, and production build. The combined runner
served its frontend with HTTP 200 at `http://127.0.0.1:4178/`; an invalid request to
its proxied `/api/hint` endpoint returned the expected HTTP 400. Browser smoke tests
covered menu start, pause/resume, restart, return to menu, zero time movement during
pause, and a 390px-wide viewport, with no browser console errors.

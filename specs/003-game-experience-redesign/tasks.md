# Tasks: Game Experience Redesign

**Input**: Design documents from `/specs/003-game-experience-redesign/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/presentation-state.md`, and `quickstart.md`

**Tests**: Presentation-transition tests are required by SC-003. Existing deterministic
game and evaluation tests remain regression checks.

## Phase 1: Licensed asset setup

**Purpose**: Keep the imported visual subset small, traceable, and ready for browser loading.

- [x] T001 Verify the selected 32x32 tilesheets and character sheets in `frontend/public/assets/` against `frontend/public/assets/ATTRIBUTION.md`.
- [x] T002 Record the licensed tile-art direction and the two visual enemy roles in `specs/003-game-experience-redesign/spec.md`, `research.md`, and `plan.md`.

---

## Phase 2: Presentation foundation

**Purpose**: Establish the pure state boundary and one safe browser session lifecycle before UI stories.

- [x] T003 [P] Add failing state-transition coverage for all five presentation views in `frontend/tests/session.test.ts`.
- [x] T004 Create the `menu`, `playing`, `paused`, `won`, and `lost` reducer in `frontend/src/presentation/session.ts` according to `specs/003-game-experience-redesign/contracts/presentation-state.md`.
- [x] T005 Refactor animation ownership, active-session creation, input reset, and timestamp reset in `frontend/src/main.ts` so only `playing` invokes `updateGame`.

**Checkpoint**: The simulation can be safely started, frozen, resumed, restarted, and discarded without duplicate loops or elapsed-time jumps.

---

## Phase 3: User Story 1 - Start a clear game session (Priority: P1) 🎯 MVP

**Goal**: Present an accessible main menu that communicates the game and starts a fresh selected-difficulty session.

**Independent Test**: Open the page, navigate the menu with keyboard and pointer, choose Easy or Normal, and start a fresh session using that choice.

- [x] T006 [P] [US1] Add accessible main-menu title, objective, controls, difficulty radio group, and Start Game action in `frontend/index.html`.
- [x] T007 [P] [US1] Add responsive visual styling and visible focus treatment for the menu controls in `frontend/index.html`.
- [x] T008 [US1] Bind menu difficulty and Start Game actions to the presentation controller in `frontend/src/main.ts`.
- [x] T009 [US1] Run the focused session test and manually verify the User Story 1 menu flow using `specs/003-game-experience-redesign/quickstart.md`.

---

## Phase 4: User Story 2 - Control an active game session (Priority: P1)

**Goal**: Let a player pause an active session and then resume, restart, or return to the menu without changing deterministic rules.

**Independent Test**: Start, move, pause, confirm the state is fixed, then exercise Resume, Restart, and Quit Game in separate runs.

- [x] T010 [P] [US2] Add failing pause, resume, restart, and quit no-op/transition cases to `frontend/tests/session.test.ts`.
- [x] T011 [US2] Add in-play Pause and accessible pause-panel Resume, Restart, and Quit Game controls in `frontend/index.html`.
- [x] T012 [US2] Connect pause actions, input/timing resets, and hint-request cancellation in `frontend/src/main.ts`.
- [x] T013 [US2] Manually verify pause freezes game time and movement, then verify each session action using `specs/003-game-experience-redesign/quickstart.md`.

---

## Phase 5: User Story 3 - Finish or retry a game (Priority: P2)

**Goal**: Give win and loss terminal states clear next actions that reset a new run or return to the menu.

**Independent Test**: Trigger each deterministic terminal phase and use both Restart and Main Menu actions.

- [x] T014 [P] [US3] Add `gameWon` and `gameLost` transition cases to `frontend/tests/session.test.ts`.
- [x] T015 [US3] Add distinct victory and game-over panels with Restart and Main Menu actions in `frontend/index.html`.
- [x] T016 [US3] Derive terminal presentation transitions from `GameState.phase` and bind outcome actions in `frontend/src/main.ts`.
- [x] T017 [US3] Verify a restarted terminal session resets score, lives, player position, and collectibles in `frontend/tests/session.test.ts` and the browser smoke flow.

---

## Phase 6: User Story 4 - Read and enjoy the redesigned level (Priority: P2)

**Goal**: Render a clear city-rooftop route using the selected licensed art, a Scout player, and two visually distinct enemy types.

**Independent Test**: At desktop and narrow widths, identify and use the route, ladders, player, patrol zombie, cyclops hazard, collectibles, and goal without clipped actions.

- [x] T018 [P] [US4] Define image loading and source-rectangle metadata for the selected sheets in `frontend/src/rendering/assets.ts`.
- [x] T019 [US4] Replace prototype geometry in `frontend/src/rendering/renderGame.ts` with tile-sheet city scenery aligned to the existing collision platform and ladder coordinates.
- [x] T020 [US4] Render the Scout player, Zombie 1 patrol enemy, and Zombie 2 cyclops rolling hazard from `frontend/public/assets/` in `frontend/src/rendering/renderGame.ts`.
- [x] T021 [US4] Add responsive canvas framing, HUD treatment, and visible asset credit in `frontend/index.html`.
- [x] T022 [US4] Manually verify route readability and primary controls at desktop and narrow widths using `specs/003-game-experience-redesign/quickstart.md`.

---

## Phase 7: Validation and convergence

- [x] T023 Run `npm.cmd run test`, `npm.cmd run typecheck`, and `npm.cmd run build` from `package.json`.
- [x] T024 Run the combined local development smoke test from `specs/003-game-experience-redesign/quickstart.md` and record actual evidence only.
- [x] T025 Review the browser build, `git diff`, and `git status` for secrets, unintended pack files, licensing attribution, and scope expansion.
- [x] T026 Mark completed work in `specs/003-game-experience-redesign/tasks.md` and run the Spec Kit analysis/convergence workflow.

## Dependencies & Execution Order

`T001–T005` establish the asset and presentation foundation. US1 and US2 are P1;
US2 relies on the session lifecycle from US1. US3 relies on terminal state wiring in
the foundation. US4 can progress after the presentation foundation, but integrates
with the final browser shell. Validation requires all desired stories.

## Parallel Opportunities

- T003 and the asset-documentation tasks can progress independently.
- In US1, T006 and T007 change distinct aspects of `frontend/index.html` but should
  be merged deliberately because they touch the same file.
- In US4, T018 can proceed while menu/session markup is being prepared.

## Implementation Strategy

Complete the pure presentation model first, deliver the main menu and pause loop,
then add terminal views and the tile-art rendering. Keep all new presentation work
outside the deterministic game rules and validate each story before proceeding.

## Phase 8: Convergence

- [x] T027 Record the before/after four-evaluation evidence and the combined-runner defect/fix in `specs/003-game-experience-redesign/quickstart.md` per Constitution IV (partial).

## Phase 9: Visual asset correction checkpoints

**Purpose**: Replace incorrect whole-sheet crops with a small, reviewable set of
properly aligned sprites and single-image scenery assets.

- [x] T028 Audit the screenshot defects, copy a named scenery subset from the pack's
  `ME_Theme_Sorter_32x32` single-image folders, and record exact Scout, Zombie, and
  Cyclops frame rectangles in `frontend/src/rendering/assets.ts`.
- [x] T029 Rebuild the Canvas background, platforms, ladders, characters, collectibles,
  and Safehouse using the corrected asset map without visible collision rectangles.
- [x] T030 Rebuild the main-menu, pause, result, HUD, and action-button styling from one
  coherent Modern UI slice while preserving semantic HTML and focus states.
- [x] T031 Replace the floating platform cutouts with one coherent high-rise structure,
  render directional Scout frames, and replace the Safehouse with a collectible beacon.
- [x] T032 Correct the Scout direction frames, anchor and enlarge the beacon, remove the
  gameplay footer, and stage fast/slow enemies across the three threat levels.
- [x] T033 Run automated checks and record browser screenshots for menu, playing, pause,
  and beacon/result states at desktop and narrow widths.

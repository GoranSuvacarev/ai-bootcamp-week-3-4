# Implementation Plan: Game Experience Redesign

**Branch**: `003-game-experience-redesign` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-game-experience-redesign/spec.md`

## Summary

Turn the existing Canvas prototype into a complete, licensed tile-art browser-game experience.
The frontend will gain a small presentation-state controller that owns menu, play,
pause, win, and loss views, while the existing deterministic game core remains the
only authority for movement, damage, scoring, and outcomes. The visual redesign uses
a selected, licensed 32x32 tile-art subset plus responsive HTML/CSS controls; it
introduces no provider changes or gameplay-rule changes.

## Technical Context

**Language/Version**: TypeScript 5.6 for the browser; modern ES modules in Chromium/Firefox/Safari-class browsers

**Primary Dependencies**: Vite 5.4, Vitest 2.1, Canvas 2D, browser DOM APIs; no new runtime dependency

**Storage**: N/A; difficulty and session state are in memory only

**Testing**: Vitest for pure presentation-state transitions and existing deterministic game tests; production build and manual desktop/narrow-width browser smoke test

**Target Platform**: Modern desktop and narrow-width mobile browser viewports

**Project Type**: Web application; Feature 003 changes the `frontend/` project only

**Performance Goals**: One `requestAnimationFrame` loop per active page; stable, responsive Canvas gameplay at the existing 640 x 900 logical resolution

**Constraints**: Preserve current movement, collision, scoring, difficulty, win, and loss rules; do not run simulation while paused or outside play; keyboard controls must not capture menu-control input; use only the selected licensed assets with visible attribution

**Scale/Scope**: One player, one level, two existing difficulty options, five presentation states, and a compact set of DOM controls layered around one Canvas

## Constitution Check

| Gate | Result | Evidence |
|------|--------|----------|
| Bounded feature scope | Pass | This feature is limited to menus, session controls, responsive presentation, and selected licensed visuals in `frontend/`. Accounts, persistence, audio, new enemy behavior, and gameplay changes remain out of scope. |
| Specification before implementation | Pass | `spec.md` defines scenarios, requirements, scope limits, and measurable outcomes. This plan translates them to implementation and test work. |
| Deterministic core and testable contracts | Pass | The presentation controller is pure and unit-tested. It pauses calls to `updateGame`; existing game rules and their tests remain unchanged except for compatible integration points. No network contract is changed. |
| Evidence-driven changes | Pending implementation | Preserve and run the existing deterministic eval cases, add transition checks, then document the browser smoke evidence before convergence. |
| Human review and trusted boundaries | Pass | This plan does not move provider credentials or alter the backend boundary. The human reviewer will inspect task, implementation, and evidence checkpoints. |

The post-design check also passes: the design adds no constitution exception or
unapproved dependency.

## Project Structure

### Documentation (this feature)

```text
specs/003-game-experience-redesign/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── presentation-state.md
└── tasks.md                    # Created in the next workflow phase
```

### Source Code (repository root)

```text
frontend/
├── index.html                  # Application shell, accessible controls, visual styling
├── public/assets/               # Selected 32x32 licensed spritesheets and attribution
├── src/
│   ├── main.ts                 # DOM binding, animation ownership, and session orchestration
│   ├── game/
│   │   ├── config.ts
│   │   ├── level.ts
│   │   ├── rules.ts            # Existing deterministic game engine
│   │   ├── types.ts
│   │   └── validation.ts
│   ├── input/
│   │   └── controls.ts         # Keyboard game input, reset while presentation changes
│   ├── presentation/
│   │   └── session.ts          # Pure state/action transition reducer
│   └── rendering/
│       └── renderGame.ts       # Original Canvas scene, landmarks, sprites, and HUD scene data
└── tests/
    ├── session.test.ts         # Presentation flow and restart invariants
    └── *.test.ts               # Existing deterministic game regression suite

backend/                         # Unchanged by Feature 003
packages/game-contracts/         # Unchanged by Feature 003
```

**Structure Decision**: Retain the separated workspace created by Feature 002. The
browser project owns presentation and rendering because they have no trusted-server
responsibility. A pure `presentation/session.ts` module keeps session transitions
testable without DOM or Canvas mocks, while `main.ts` remains the only integration
point for DOM events and animation timing.

## Implementation Approach

1. Add a pure presentation-state model with states `menu`, `playing`, `paused`,
   `won`, and `lost`; define allowed actions and reject no-op/invalid transitions by
   returning the current state.
2. Refactor browser orchestration so starting and restarting create a fresh game
   state using the selected difficulty, quitting returns to `menu`, and pausing
   freezes calls to `updateGame`. Reset keyboard input and the frame timestamp on
   every state boundary that could otherwise carry movement or elapsed time forward.
3. Replace the current prototype shell with accessible DOM panels for the main menu,
   in-play controls, pause menu, and distinct result screens. Render only the panel
   matching presentation state, maintain visible keyboard focus, and use semantic
   buttons/radio inputs.
4. Render the level from selected Modern Exteriors 32x32 sheets: city background,
   clearly tiered platforms, high-contrast ladders, a Scout player, zombie patrol,
   cyclops rolling hazard, collectibles, and a goal landmark. Use Modern UI Style 2
   only as decorative panel treatment; retain accessible HTML controls. Keep every
   drawn object aligned to the engine geometry so the visual route remains playable.
5. Add transition-focused tests, run the existing game/eval tests, typecheck, build,
   and manually exercise start/pause/resume/restart/quit/win/loss at desktop and
   narrow widths. Record evidence at convergence rather than changing unrelated docs.

## Complexity Tracking

No constitution violations or complexity exceptions are required.

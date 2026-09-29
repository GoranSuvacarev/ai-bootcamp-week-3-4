# Implementation Plan: Client-Server Separation

**Branch**: `002-client-server-separation` | **Date**: 2026-09-29 | **Spec**:
[spec.md](spec.md)

**Input**: Feature specification from
`/specs/002-client-server-separation/spec.md`

## Summary

Move the existing Vite browser game and Node hint endpoint into separate frontend
and backend projects while keeping one repository and preserving the playable game.
The root workspace owns only orchestration; the frontend owns deterministic gameplay
and presentation; the backend owns the `/api/hint` boundary and server-only
configuration. A small contract workspace gives both applications one validated
public request/response vocabulary.

## Technical Context

**Language/Version**: TypeScript 5.9 for the browser and contract packages;
Node.js ESM for the existing HTTP server during this migration.

**Primary Dependencies**: Vite 7, Vitest 3, TypeScript 5.9, and native npm
workspaces. No new game engine, server framework, or provider SDK is introduced.

**Storage**: N/A; game state and API snapshots remain in memory.

**Testing**: Browser game-rule tests, server contract tests, workspace typechecks,
production builds, and one combined local smoke test.

**Target Platform**: Modern desktop browsers and a local Node.js server.

**Project Type**: Two-project web application in one workspace repository.

**Performance Goals**: Preserve the existing approximately 60 FPS local game loop;
the hint endpoint must not block gameplay while unavailable.

**Constraints**: Browser output contains no credential; server-dependent failure is
safe; deterministic game tests run without the server or provider; no Session 004
tool or Gemini behavior is added in this feature.

**Scale/Scope**: One frontend, one backend, one shared public contract, one existing
hint route, and one root local-development command.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Bounded feature scope**: PASS. The migration creates only the authorized
  frontend, backend, and small contract boundary; redesign, Gemini, and the
  deterministic tool remain deferred.
- **Specification before implementation**: PASS. The reviewed Feature 002 spec and
  requirements checklist define compatibility, ownership, and verification.
- **Testable contracts and deterministic core**: PASS. The public hint contract is
  specified before moving code, and game rules remain browser-only and offline.
- **Evidence-driven changes**: PASS. The current 53-test baseline is preserved;
  focused workspace and contract checks will be recorded after migration.
- **Trusted boundaries**: PASS. The browser has no credential or authorization role;
  the server owns the existing protected configuration.

**Post-design re-check**: PASS. The design adds no provider, tool, write operation,
or unrelated gameplay scope.

## Project Structure

### Documentation (this feature)

```text
specs/002-client-server-separation/
├── plan.md              # This file ($speckit-plan command output)
├── research.md          # Phase 0 output ($speckit-plan command)
├── data-model.md        # Phase 1 output ($speckit-plan command)
├── quickstart.md        # Phase 1 output ($speckit-plan command)
├── contracts/           # Phase 1 output ($speckit-plan command)
└── tasks.md             # Phase 2 output ($speckit-tasks command - NOT created by $speckit-plan)
```

### Source Code (repository root)

```text
package.json                         # workspace scripts only
scripts/
└── dev.mjs                          # starts frontend and backend together
packages/
└── game-contracts/
    ├── src/hint.ts                  # public request/response declarations
    └── package.json
frontend/
├── src/
│   ├── game/                        # deterministic rules and level
│   ├── input/
│   ├── rendering/
│   ├── api/                         # typed browser client
│   └── main.ts
├── tests/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
backend/
├── src/
│   ├── http/                        # server and route handlers
│   ├── hint/                        # existing provider seam, unchanged here
│   └── config/
├── tests/
├── tsconfig.json
└── package.json
```

**Structure Decision**: Use native npm workspaces. `frontend/` and `backend/` are
independently runnable projects; `packages/game-contracts/` has no runtime secrets
or game state and contains only the public boundary shared by both projects.

## Implementation Phases

1. Record the existing passing root checks and current public `/api/hint` behavior
   as the migration baseline.
2. Create the workspace manifests, root orchestration command, and shared public
   contract with focused contract tests before moving application source.
3. Move browser files into `frontend/`; update imports, Vite proxy, and browser test
   paths without changing deterministic game rules or gameplay behavior.
4. Move the server files into `backend/`; update the route to consume the shared
   contract and retain the current safe invalid-request and unavailable outcomes.
5. Add independent frontend and backend typecheck, test, build, and run commands;
   add a root command that starts both and terminates both when either exits.
6. Verify the browser build excludes a known test credential, execute the combined
   smoke scenario, and capture the command results for later evidence.

## Complexity Tracking

No constitution violation is required. The shared contract package is the smallest
way to avoid duplicate public API shapes while keeping two independently runnable
projects. It contains no provider SDK, credential, authorization policy, or game
state.

# Tasks: Client-Server Separation

## Phase 1: Baseline and Workspace Setup

- [ ] T001 Record the pre-migration root test, typecheck, and build results in `specs/002-client-server-separation/quickstart.md`.
- [ ] T002 Create workspace manifests in `package.json`, `frontend/package.json`, `backend/package.json`, and `packages/game-contracts/package.json`.
- [ ] T003 [P] Create `frontend/tsconfig.json` and `frontend/vite.config.ts` for an independently buildable browser project.
- [ ] T004 [P] Create `backend/tsconfig.json` and backend test/build scripts for an independently verifiable server project.
- [ ] T005 Create `scripts/dev.mjs` and root scripts in `package.json` to start and stop both projects together.

## Phase 2: Shared Contract Foundation

- [ ] T006 Create runtime request/response validation and public types in `packages/game-contracts/src/hint.ts`.
- [ ] T007 [P] Add contract validation tests in `packages/game-contracts/tests/hint.test.ts` for valid requests, unknown fields, invalid values, and safe errors.
- [ ] T008 Export the public contract from `packages/game-contracts/src/index.ts` and consume it from both project manifests.

## Phase 3: User Story 1 - Run the game through a clear application boundary

**Goal**: Preserve playable game behavior while browser and server communicate only through the public hint contract.

- [ ] T009 [P] [US1] Move the browser shell, sources, and deterministic tests to `frontend/index.html`, `frontend/src/`, and `frontend/tests/` without changing game rules.
- [ ] T010 [P] [US1] Move the HTTP server and hint tests to `backend/src/` and `backend/tests/` without moving any browser-owned game state to the server.
- [ ] T011 [US1] Replace browser-side direct request parsing in `frontend/src/api/hintClient.ts` and integrate it from `frontend/src/main.ts`.
- [ ] T012 [US1] Replace server-side request validation in `backend/src/http/hintServer.ts` with the shared contract and retain safe unavailable behavior.
- [ ] T013 [US1] Add integration tests in `backend/tests/hint-server.test.mjs` for the documented request, success, invalid, and unavailable responses.
- [ ] T014 [US1] Run the frontend game tests and backend contract tests independently.

## Phase 4: User Story 2 - Operate each project independently

**Goal**: A developer can verify and run frontend and backend separately or together.

- [ ] T015 [US2] Add independent `dev`, `test`, `typecheck`, and `build` commands to `frontend/package.json` and `backend/package.json`.
- [ ] T016 [US2] Configure `frontend/vite.config.ts` to use the documented local backend origin only for `/api` during development.
- [ ] T017 [US2] Verify root orchestration in `scripts/dev.mjs` stops the paired process when either child exits.
- [ ] T018 [US2] Update `specs/002-client-server-separation/quickstart.md` with actual commands, addresses, and results.

## Phase 5: User Story 3 - Keep credentials and authority on the server

**Goal**: Browser output cannot contain server credentials or decide protected behavior.

- [ ] T019 [US3] Add a browser-build credential exclusion check in `frontend/tests/credential-boundary.test.mjs`.
- [ ] T020 [US3] Ensure `backend/src/config/` reads provider configuration only from server environment variables and no browser configuration exposes it.
- [ ] T021 [US3] Verify the server rejects unsupported request fields before its provider seam is invoked.

## Phase 6: Validation and Evidence

- [ ] T022 Run all independent workspace checks and the combined local smoke scenario from `specs/002-client-server-separation/quickstart.md`.
- [ ] T023 Review `git diff`, `git status`, browser build output, and `.gitignore` for secrets, generated files, or scope expansion.
- [ ] T024 Update this task list, evidence notes, and project documentation with actual outcomes only.

## Dependencies

`T001–T008` block all story work. `US1` precedes `US2` and `US3` because it establishes the moved source and shared contract. `T022–T024` require all earlier work.

## Implementation Strategy

Complete the contract and workspace foundation, migrate the browser and server without behavioral changes, then validate independent execution and the credential boundary. Feature 003 begins only after this feature converges.

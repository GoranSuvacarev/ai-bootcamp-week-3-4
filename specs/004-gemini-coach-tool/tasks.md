---
description: "Task list for Gemini Coach and Read-Only Game State Tool"
---

# Tasks: Gemini Coach and Read-Only Game State Tool

**Input**: Design documents from /specs/004-gemini-coach-tool/

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Required. The specification requires local fake model/tool proof for every success, negative, failure, retry, and cancellation path. Write each focused test before its implementation task and observe its initial failure.

**Organization**: Tasks are grouped by user story. Each story has a local fake-based independent test; no test requires a Gemini key.

## Format: ID, optional parallel marker, story label, action, exact path

- **[P]**: Can proceed alongside other tasks in the same phase after its dependencies are met.
- **[US1]**, **[US2]**, **[US3]**: Trace work to the matching feature specification story.
- Do not stage or edit unrelated user-owned uncommitted documentation.

## Phase 1: Setup

**Purpose**: Prepare the backend-only provider dependency and bounded local configuration.

- [ ] T001 Add the Google GenAI SDK as a backend-only dependency and lock it in backend/package.json and package-lock.json.
- [ ] T002 [P] Document GEMINI_API_KEY and the one explicit GEMINI_MODEL value, without a credential, in backend/.env.example.
- [ ] T003 [P] Replace OpenAI-specific names and environment variables in backend/src/hint.mjs with Gemini-neutral dependency assembly, without changing the browser route yet.

**Checkpoint**: The backend can be assembled without an OpenAI package, key, endpoint, or model name.

---

## Phase 2: Foundational Contracts and Policy

**Purpose**: Create the shared validation and safe-result boundaries that block all three stories.

- [ ] T004 Write failing shared-contract tests for exact HintRequest fields, ToolProposal, GameStateSnapshot, HintResponse, and public error envelopes in packages/game-contracts/tests/hint.test.mjs.
- [ ] T005 Extend packages/game-contracts/src/hint.mjs with strict runtime validators: HintRequest accepts only difficulty easy/normal, lives 0 through 3, and bounded lastDamage; ToolProposal accepts exactly get_game_state with one detail value summary/tactical; HintResponse has exactly hint up to 300 characters, suggestedAction move_left/move_right/jump/climb/wait/avoid, and urgency low/medium/high.
- [ ] T006 [P] Create a redacted request-event factory and transient-provider error classifier in backend/src/coach/telemetry.mjs; events include only requestId, operation, status, latencyMs, and attempts.
- [ ] T007 [P] Create validation adapters in backend/src/coach/validation.mjs that map invalid context, invalid tool proposal, malformed snapshot, malformed final output, cancellation, and unavailable provider conditions to stable public outcomes.

**Checkpoint**: Shared runtime contracts and safe error policy are testable without a provider or HTTP server.

---

## Phase 3: User Story 1 - Get a Hint from Current Game Facts (Priority: P1) 🎯 MVP

**Goal**: After a collision, a player receives one concise structured hint only after Gemini has proposed and the application has executed the one allowed read-only tool.

**Independent Test**: A fake Gemini adapter proposes get_game_state with summary, receives one validated snapshot, returns a valid HintResponse, and the HTTP endpoint exposes that result with one tool call and one redacted event.

### Tests for User Story 1

- [ ] T008 [P] [US1] Write the focused successful two-turn fake flow test, asserting one proposal, exact { detail: "summary" } arguments, one tool execution, one final call, valid HintResponse, and one safe event in backend/tests/hint-flow.test.mjs.
- [ ] T009 [P] [US1] Update the valid HTTP integration test to assert the complete HintResponse response and that no server-side key appears in backend/tests/hint-server.test.mjs.

### Implementation for User Story 1

- [ ] T010 [US1] Implement the sole deterministic read-only get_game_state tool in backend/src/coach/game-state-tool.mjs, deriving only detail, difficulty, lives, recentThreat, and at most three known nearby-object summaries from validated context.
- [ ] T011 [US1] Implement the provider-neutral two-turn coordinator in backend/src/coach/hint-flow.mjs: require exactly one valid tool proposal, validate its snapshot, send one function result back, validate the final HintResponse, and emit a redacted event.
- [ ] T012 [US1] Implement the server-only Google Gemini adapter in backend/src/coach/gemini-adapter.mjs with one get_game_state declaration, manual function-response continuation, JSON final output request, and AbortSignal support.
- [ ] T013 [US1] Rewire POST /api/hint in backend/src/hint.mjs to validate the browser request, assemble the Gemini adapter/tool/flow, and expose only the validated public HintResponse.
- [ ] T014 [US1] Update frontend/src/main.ts to render only validated HintResponse.hint text while preserving the existing request-abort behavior on new damage and session transitions.

**Checkpoint**: The MVP passes its fake successful flow and the player can request a safe structured hint after a collision.

---

## Phase 4: User Story 2 - Reject Unsafe Tool Requests (Priority: P1)

**Goal**: The application proves it will not execute unknown, malformed, direct, zero-call, or multi-call model proposals.

**Independent Test**: Fake-model cases for unknown name, missing/additional/wrong-type detail, direct response, and multiple proposals all return a stable invalid-tool result with tool call count zero.

### Tests for User Story 2

- [ ] T015 [P] [US2] Add fake-model tests that assert zero get_game_state executions for an unsupported tool, missing detail, additional argument, wrong-type detail, direct model answer, zero proposals, and multiple proposals in backend/tests/hint-flow.test.mjs.
- [ ] T016 [P] [US2] Add HTTP integration assertions that invalid browser HintRequest fields return INVALID_REQUEST before the Gemini adapter or tool is called in backend/tests/hint-server.test.mjs.

### Implementation for User Story 2

- [ ] T017 [US2] Extend backend/src/coach/validation.mjs and backend/src/coach/hint-flow.mjs so every rejected proposal maps to the stable invalid-tool public result and prevents both tool execution and final model continuation.
- [ ] T018 [US2] Harden backend/src/coach/game-state-tool.mjs to reject any snapshot with unknown/private/out-of-range fields before it can return to Gemini, and preserve the read-only one-call limit.
- [ ] T019 [US2] Update backend/src/hint.mjs to map invalid browser context and rejected tool outcomes to the public envelopes in packages/game-contracts/src/hint.mjs without leaking provider text or stack details.

**Checkpoint**: All unsafe tool paths demonstrate zero execution and no model-provided content reaches the UI.

---

## Phase 5: User Story 3 - Continue Safely When AI Is Unavailable (Priority: P2)

**Goal**: Provider and malformed-output failures produce safe messages, bounded retries, cancellation, and no stale hint while gameplay continues.

**Independent Test**: A fake transient failure retries each provider stage at most once; a final-answer retry reuses the snapshot without another tool call; non-transient/malformed/cancelled paths never retry; stale browser requests do not update the new game session.

### Tests for User Story 3

- [ ] T020 [P] [US3] Add fake-provider tests for at most two attempts per proposal/final stage, final-answer retry with one tool execution, timeout, missing key, non-transient failure, cancellation, malformed snapshot, and malformed final HintResponse in backend/tests/hint-flow.test.mjs.
- [ ] T021 [P] [US3] Add HTTP tests for safe unavailable/malformed/cancelled public envelopes and redacted event fields in backend/tests/hint-server.test.mjs.
- [ ] T022 [P] [US3] Add a frontend regression test for generic safe error display and stale-request suppression after restart/menu/new damage in frontend/tests/session.test.ts.

### Implementation for User Story 3

- [ ] T023 [US3] Implement the 30-second overall deadline, propagated cancellation, classified retry for network/429/5xx failures only, and two-attempt-per-stage cap in backend/src/coach/hint-flow.mjs and backend/src/coach/gemini-adapter.mjs; reuse the validated snapshot on final-stage retry.
- [ ] T024 [US3] Complete safe event recording in backend/src/coach/telemetry.mjs and wire it through backend/src/hint.mjs without recording request, snapshot, provider text, API key, or stack trace.
- [ ] T025 [US3] Update frontend/src/main.ts to replace all failed non-aborted hint responses with the defined generic unavailable message and to suppress stale completions.
- [ ] T026 [US3] Add backend/.env.example guidance and backend/src/index.mjs startup behavior for an absent Gemini key, keeping local fake tests and normal gameplay usable.

**Checkpoint**: Every controlled failure preserves play, respects the retry/cancellation policy, and exposes only safe public information.

---

## Phase 6: Evidence and Cross-Cutting Verification

**Purpose**: Validate all work together, preserve reviewer-ready evidence, and keep user-owned prior documentation outside this feature unless explicitly reconciled later.

- [ ] T027 [P] Run the focused shared-contract, backend, and frontend suites from specs/004-gemini-coach-tool/quickstart.md and record actual commands/results in specs/004-gemini-coach-tool/evidence.md.
- [ ] T028 [P] Run npm.cmd run test, npm.cmd run typecheck, and npm.cmd run build from package.json; add their actual outcomes to specs/004-gemini-coach-tool/evidence.md.
- [ ] T029 Run the local browser smoke matrix from specs/004-gemini-coach-tool/quickstart.md, including unavailable-key behavior and stale-request cancellation; record only public results and redacted event fields in specs/004-gemini-coach-tool/evidence.md.
- [ ] T030 [P] Review package-lock.json, backend/package.json, backend/src/, frontend/src/main.ts, packages/game-contracts/, and specs/004-gemini-coach-tool/ against spec.md and contracts/; confirm there is one Gemini provider, one read-only tool, no OpenAI references, no fallback, no secrets, and no unrelated documentation staged.
- [ ] T031 Prepare a handoff note in specs/004-gemini-coach-tool/evidence.md that links the tool contract, success/negative/failure evidence, known limitation, and pair-review contribution; leave the currently user-owned docs/AI_USAGE_LOG.md untouched until its owner reconciles it.

**Checkpoint**: The feature is ready for Spec Kit analysis and implementation convergence.

---

## Dependencies and Execution Order

### Phase Dependencies

- **Phase 1** has no dependencies.
- **Phase 2** depends on Phase 1 and blocks every user story.
- **US1** depends on Phase 2 and delivers the MVP.
- **US2** depends on Phase 2 and reuses the US1 coordinator/tool boundaries.
- **US3** depends on the US1 request path and its cancellation integration.
- **Phase 6** depends on all three stories.

### User Story Dependencies

- **US1 (P1)**: First independently valuable slice; its fake success flow is the MVP.
- **US2 (P1)**: Shares the flow but remains independently testable through zero-call fakes.
- **US3 (P2)**: Adds reliability to the assembled request/UI path.

### Parallel Opportunities

- T002 and T003 can run beside each other after T001.
- T006 and T007 can run after T005.
- T008 and T009 can run in parallel; T015/T016 and T020/T021/T022 can also run in parallel.
- T027/T028/T030 can run in parallel after implementation; T029 follows the available local server.

## Parallel Example: User Story 2

~~~text
Task: T015 [US2] fake-model zero-call tests in backend/tests/hint-flow.test.mjs
Task: T016 [US2] invalid-browser-request tests in backend/tests/hint-server.test.mjs
~~~

## Implementation Strategy

### MVP First

1. Complete Phases 1 and 2.
2. Complete US1 through T014.
3. Run T008/T009 and the existing workspace checks before adding reliability work.

### Incremental Delivery

1. Successful controlled tool flow.
2. Zero-call rejection proof for unsafe proposals.
3. Safe errors, retry, cancellation, and stale UI suppression.
4. Full evidence and review.

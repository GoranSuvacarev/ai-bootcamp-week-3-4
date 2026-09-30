# Feature Specification: Gemini Coach and Read-Only Game State Tool

**Feature Branch**: 004-gemini-coach-tool
**Created**: 2026-09-30
**Status**: Ready for planning
**Input**: Add one controlled AI Hint. Gemini may propose one defined read-only game-state tool. The application validates and executes it, then validates a structured hint before it reaches the player.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Get a hint from current game facts (Priority: P1)

As a player who has lost a life, I can ask for concise advice based on the current round, so I can choose a safer next move without the AI changing the game.

**Independent Test**: With local fakes, submit a valid request; verify one get_game_state proposal with valid arguments, one tool execution, and one validated HintResponse.

**Acceptance Scenarios**:

1. **Given** a recent collision, **When** the player asks for a hint, **Then** one concise relevant suggestion is displayed.
2. **Given** the model requests get_game_state with detail summary or tactical, **When** it is valid, **Then** the application executes it once and returns only allowed facts.
3. **Given** a valid final response, **When** shown, **Then** it contains short advice, a permitted action, and urgency.

---

### User Story 2 - Reject unsafe tool requests (Priority: P1)

As a player, I can rely on the game not to execute unexpected or invalid AI requests, so the hint feature cannot alter the game or access unrelated data.

**Independent Test**: Make the fake model request an unknown tool or invalid arguments; verify zero tool calls and a stable safe result.

**Acceptance Scenarios**:

1. **Given** an unsupported tool name, **When** it is proposed, **Then** no tool runs and a safe failure is returned.
2. **Given** get_game_state has missing, additional, wrong-type, or unsupported arguments, **When** proposed, **Then** no tool runs and a safe failure is returned.
3. **Given** valid arguments, **When** the tool runs, **Then** it only reads a bounded game snapshot and cannot change state, configuration, files, or services.

---

### User Story 3 - Continue safely when AI is unavailable (Priority: P2)

As a player, I receive a short stable message when the hint cannot be produced, so I can continue or restart without seeing provider details.

**Independent Test**: Fake timeout, cancellation, malformed tool output, and malformed final output; verify safe results, bounded attempts, and no stale hint after a new collision or restart.

**Acceptance Scenarios**:

1. **Given** the provider is unconfigured, unavailable, or times out, **When** a hint is requested, **Then** the defined unavailable message is shown and gameplay remains usable.
2. **Given** tool output or final output is invalid, **When** received, **Then** it is never shown as a successful hint.
3. **Given** a restart, menu return, or newer hit, **When** an earlier request completes, **Then** its advice is not shown for the new state.

---

### Edge Cases

- Invalid or oversized player context is rejected before Gemini or the tool.
- Only get_game_state is permitted; its input is exactly one detail value: summary or tactical.
- A direct model answer, zero/multiple tool proposals, or a malformed proposal is rejected; the final-answer turn does not begin.
- Unknown, private, malformed, or out-of-range tool output is rejected before returning it to Gemini.
- A final hint with an unknown action or urgency, missing or oversized text, or extra fields is rejected before the UI receives it.
- Cancellation stops further attempts. Only explicitly transient provider failures may retry within a fixed finite budget.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The feature MUST expose exactly one model-callable read-only tool named get_game_state, available only to the AI Hint flow.
- **FR-002**: The tool MUST accept exactly one detail argument with value summary or tactical. Unknown tools and missing, additional, wrong-type, or unsupported arguments MUST be rejected before execution.
- **FR-003**: The tool MUST return only a validated minimized local-round snapshot: difficulty, remaining lives, recent threat category, and relevant nearby objects. It MUST NOT return credentials, environment data, source code, files, arbitrary browser data, or mutable game controls.
- **FR-004**: The application MUST require exactly one valid tool proposal, validate player context before the model request, validate tool output before returning it to Gemini, and validate final output before exposing it to the UI.
- **FR-005**: A successful response MUST be a HintResponse with exactly hint (non-empty actionable text up to 300 characters), suggestedAction (move_left, move_right, jump, climb, wait, or avoid), and urgency (low, medium, or high).
- **FR-006**: Stable public results MUST cover invalid input, disallowed tool proposals, malformed tool output, malformed final output, cancellation, and unavailable AI, without credentials, raw provider output, stack traces, or private payloads.
- **FR-007**: Each attempt MUST record a safe event containing request ID, operation, final status, elapsed time, and attempts, but no payloads, provider text, or secrets.
- **FR-008**: The flow MUST have one finite overall deadline, cancellation, and retries only for explicitly transient provider failures. Each of the proposal and final-answer provider stages may make at most two attempts; invalid input, disallowed proposals, malformed data, cancellation, and configuration failure MUST not retry. A final-answer retry MUST reuse the one validated tool result and MUST NOT execute the tool again.
- **FR-009**: Gemini credentials remain server-side. The browser receives only validated public results and never authorizes tool calls.
- **FR-010**: Local fake model and tool tests MUST prove success, exact call arguments and counts, invalid arguments, unsupported tool, malformed tool output, malformed final output, timeout/provider failure, and cancellation. A live-provider smoke test is optional.
- **FR-011**: The feature MUST NOT add a second tool, write operation, autonomous loop, account, persistence, deployment, provider fallback, or provider-credit requirement.

### Key Entities *(include if feature involves data)*

- **Hint context**: Bounded validated local-round data, used only as the source for the read-only tool.
- **Tool proposal**: The model's requested get_game_state call pending application validation.
- **Game-state snapshot**: Validated public facts returned by the sole tool.
- **HintResponse**: Validated advice containing text, suggested action, and urgency.
- **Request event**: Redacted request ID, operation, status, duration, and attempts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Local tests demonstrate one successful hint flow with one permitted tool call, correct arguments, one validated snapshot, and one valid HintResponse.
- **SC-002**: Local tests demonstrate that invalid arguments and an unsupported tool each result in zero tool executions.
- **SC-003**: Local tests demonstrate that malformed tool output, malformed final output, timeout/provider failure, and cancellation never display a successful hint.
- **SC-004**: During a local smoke test, a player who has lost a life receives a concise hint or defined safe message within 35 seconds and can continue, restart, or quit normally.
- **SC-005**: A reviewer can inspect a safe event with request ID, operation, status, elapsed time, and attempts, without a secret, raw provider content, or player payload.

## Assumptions

- The game is local and has no server-side persistence. The tool reads validated local-round context and returns a minimized snapshot; it does not authorize accounts or retrieve persistent records.
- Summary is the default detail; tactical is available only when the model requests the exact allowed argument.
- One configured Google Gemini model is sufficient. Fallback models and providers are out of scope.
- The existing AI Hint control stays available only after a life loss, and a new hit or session transition cancels stale work.

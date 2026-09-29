# Feature Specification: Gemini Coach and Read-Only Tool

**Feature Branch**: `004-gemini-coach-tool`

**Created**: 2026-09-29

**Status**: Needs tool-contract clarification before planning

**Input**: Deliver one safe, deterministic read-only tool slice and use its trusted
result to provide a concise Gemini game hint through the backend.

## User Scenarios & Testing *(mandatory)*

<!--
The exact tutor-provided tool contract is intentionally unresolved. This feature
does not authorize inventing its operation name, resource identifier, allowed scope,
or fixture response; see FR-001 and the clarification question below.
-->

### User Story 1 - Read an authorized game record (Priority: P1)

As a player, I can request the one permitted read-only game record and receive its
contracted public summary, so the game can use verified facts rather than inventing
them.

**Why this priority**: This deterministic path is the Week 4 Core requirement and
must work before any live-provider behavior is considered.

**Independent Test**: Use the tutor fixture's success case to request an allowed
record and verify the request arguments, one call, public response, request ID,
latency, and attempt count.

**Acceptance Scenarios**:

1. **Given** a valid allowed request, **When** a player asks for the record,
   **Then** the application makes one read-only call and returns only contracted
   public fields with a request ID.
2. **Given** a valid request outside the player's allowed scope, **When** the player
   requests it, **Then** the application returns FORBIDDEN and makes zero tool calls.
3. **Given** an invalid request, **When** it is submitted, **Then** the application
   returns INVALID_INPUT and makes zero tool calls.

---

### User Story 2 - Handle controlled failures safely (Priority: P1)

As a player, I receive a short, stable message when a request cannot be processed,
so I understand the outcome without seeing private data or technical details.

**Why this priority**: A tool boundary is only trustworthy when it proves the paths
where it deliberately does not call, retry, or accept an answer.

**Independent Test**: Run the fixture cases for not found, unavailable/timeout,
malformed output, and cancellation; verify the public error, call count, and bounded
attempt count for each.

**Acceptance Scenarios**:

1. **Given** a requested record does not exist, **When** it is looked up, **Then**
   the player receives NOT_FOUND and the application does not retry.
2. **Given** the fixture reports a transient unavailable condition, **When** it is
   looked up, **Then** the application retries only within its fixed budget.
3. **Given** the fixture returns malformed or private output, **When** it is
   validated, **Then** the player receives MALFORMED_OUTPUT and no false success.
4. **Given** the player cancels a request before or during the call, **When** the
   cancellation is observed, **Then** the player receives CANCELLED and no new retry
   begins.

---

### User Story 3 - Receive a Gemini game hint (Priority: P2)

As a player who has lost a life, I can ask for one concise, actionable hint based
only on trusted game facts, so I can improve my next attempt without exposing a
credential or raw provider response.

**Why this priority**: The selected Gemini hint is the requested AI feature, but it
must remain secondary to the deterministic tool boundary.

**Independent Test**: Use a local Gemini adapter fake with a successful trusted
record and verify one concise public hint; separately verify unavailable, malformed,
and cancelled provider outcomes.

**Acceptance Scenarios**:

1. **Given** the player has a recorded collision and an authorized trusted record,
   **When** they request a hint, **Then** they receive one short actionable hint.
2. **Given** Gemini is unconfigured or unavailable, **When** the player requests a
   hint, **Then** they receive a stable unavailable message and can keep playing.
3. **Given** Gemini returns an unacceptable response, **When** it is validated,
   **Then** the player receives a safe failure rather than provider text.

---

### Edge Cases

- Empty, oversized, wrong-type, or unsupported requests are rejected before a tool
  call.
- A valid request for a disallowed record returns FORBIDDEN without revealing
  whether that record exists.
- Timeout, cancellation, malformed output, and not-found outcomes have distinct
  stable public errors and never expose a raw payload, stack trace, or credential.
- Only explicitly designated transient errors may retry; the initial call counts
  toward a finite attempt budget.
- A new collision or restarted game cancels an in-flight hint and prevents stale
  advice from being shown for the new state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The feature MUST implement exactly one tutor-provided deterministic,
  read-only tool contract. [NEEDS CLARIFICATION: provide the operation name, input
  and output schema, allowed scope, fixture path, and controlled failure cases.]
- **FR-002**: The server MUST validate every tool request and authorize its scope
  before the tool call; invalid and forbidden requests MUST make zero calls.
- **FR-003**: The server MUST validate tool output and expose only contracted public
  fields in stable success and error responses.
- **FR-004**: Each request MUST have a request ID, operation, status, latency, and
  attempt count recorded without private payloads, provider responses, or secrets.
- **FR-005**: The tool adapter MUST enforce a deadline, support cancellation, and
  retry only explicitly transient failures within a finite total-attempt budget.
- **FR-006**: The server MUST use Gemini only after the deterministic Core boundary
  supplies trusted facts; the browser MUST never receive a Gemini credential or raw
  provider response.
- **FR-007**: A hint MUST be concise, actionable, relevant to the current game
  state, and safe to replace with a stable unavailable message.
- **FR-008**: Tests MUST prove exact tool arguments, call count, public mapping,
  request ID, telemetry minimum, and all required negative paths using local fakes.
- **FR-009**: The feature MUST not add a second tool, any write operation, provider
  fallback, autonomous loop, account system, or live-provider test requirement.

### Key Entities *(include if feature involves data)*

- **Tool request**: A strictly validated request for the one permitted public record.
- **Trusted record**: The validated public result from the deterministic tool.
- **Public result**: A stable success or error envelope visible to the browser.
- **Request event**: A safe trace containing operation, request ID, status, latency,
  and attempts but no secret or raw payload.
- **Hint request**: A request for concise advice using current collision context and
  a trusted record.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every required deterministic fixture passes locally without a provider
  credential, including valid, invalid, forbidden, not-found, transient failure,
  malformed-output, and cancellation cases.
- **SC-002**: Invalid and forbidden tests each prove zero tool calls; the valid test
  proves one call with the expected arguments and one request ID.
- **SC-003**: Transient-failure tests prove the configured finite attempt budget, and
  cancellation, not-found, and malformed-output tests prove zero retries.
- **SC-004**: A player can request a Gemini hint after a loss and see either one
  concise hint or a stable safe message in under 35 seconds during a smoke test.
- **SC-005**: A reviewer can inspect a safe event example containing operation,
  request ID, status, latency, and attempts with no credential or raw payload.

## Assumptions

- The existing recorded collision is an allowed bounded input for a hint request;
  hidden game state, credentials, and arbitrary browser data are not.
- Gemini credentials are server environment configuration and may be absent during
  development; deterministic local fakes remain the required verification route.
- Feature 004 depends on the completed project separation in Feature 002. The
  redesigned Feature 003 UI may consume the final public result but does not change
  the tool boundary.
- The tutor-provided tool contract is a hard dependency. Until it is supplied, the
  feature cannot enter planning or implementation.

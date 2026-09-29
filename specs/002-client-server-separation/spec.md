# Feature Specification: Client-Server Separation

**Feature Branch**: `002-client-server-separation`

**Created**: 2026-09-29

**Status**: Ready for planning

**Input**: Separate Quattro Kong's browser game and server responsibilities into
independently runnable projects while preserving the current playable game.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run the game through a clear application boundary (Priority: P1)

As a player, I can start the game and play its existing route while the browser
communicates only with a designated server boundary, so gameplay remains usable and
future online features do not expose server responsibilities in the browser.

**Why this priority**: This creates the safe foundation required before any new
provider or tool behavior is added.

**Independent Test**: Start the browser application and server application from a
clean install, load the game, move the player, and verify the existing game loop,
HUD, and safe hint-unavailable state are visible.

**Acceptance Scenarios**:

1. **Given** both applications are started, **When** a player opens the game,
   **Then** the existing game is playable without a browser console error.
2. **Given** the browser needs server information, **When** it makes a request,
   **Then** it uses only the documented public request and response shape.
3. **Given** no provider credential is configured, **When** the player requests a
   hint, **Then** the game displays a safe unavailable message and remains playable.

---

### User Story 2 - Operate each project independently (Priority: P2)

As a developer, I can install, run, test, typecheck, and build the browser and
server projects independently, so a failure can be located without running the
entire system.

**Why this priority**: Independent verification makes the split reviewable and
prevents the server from becoming an implicit part of deterministic game tests.

**Independent Test**: Run each project's documented verification commands and then
run the combined local development command.

**Acceptance Scenarios**:

1. **Given** the repository is installed, **When** a developer runs a browser-only
   verification command, **Then** it completes without starting the server.
2. **Given** the repository is installed, **When** a developer runs a server-only
   verification command, **Then** it completes without launching the browser.
3. **Given** a developer follows the quickstart, **When** they start local
   development, **Then** both applications start with documented addresses.

---

### User Story 3 - Keep credentials and authority on the server (Priority: P3)

As a project reviewer, I can verify that browser-delivered files contain no provider
credential or server authority, so a player cannot obtain or alter protected
configuration from the client.

**Why this priority**: The later Gemini and tool features depend on this trust
boundary.

**Independent Test**: Inspect the browser build and public configuration while
running the server with a test-only credential.

**Acceptance Scenarios**:

1. **Given** a server credential is configured, **When** the browser bundle is
   inspected, **Then** the credential value is absent.
2. **Given** a browser request includes an unsupported field, **When** it reaches
   the server, **Then** the server rejects it using a stable public error.

### Edge Cases

- The browser starts while the server is unavailable; gameplay remains playable and
  server-dependent controls show a safe unavailable result.
- The server receives an unsupported route, method, content type, or malformed
  request; it returns a stable error without exposing internal details.
- A local development process stops unexpectedly; its paired process also stops so
  the developer does not continue with a misleading partial environment.
- Existing game controls must not be captured by interactive browser controls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repository MUST contain separate browser and server projects with
  independently documented install, run, test, typecheck, and build workflows.
- **FR-002**: The browser project MUST own game rendering, input, menu/UI state,
  and deterministic game rules; it MUST not own provider credentials or server
  authorization decisions.
- **FR-003**: The server project MUST own request validation, protected
  configuration, and the public API boundary for server-dependent game features.
- **FR-004**: The browser-to-server contract MUST document accepted request fields,
  successful fields, and public error fields, and both sides MUST enforce it.
- **FR-005**: Existing movement, collision, scoring, win/loss, difficulty, and hint
  availability behavior MUST remain functionally equivalent after the split.
- **FR-006**: The repository MUST provide one documented combined local-development
  entry point in addition to the independent project workflows.
- **FR-007**: Verification MUST show that a server credential is absent from the
  browser-delivered files and browser-visible configuration.

### Key Entities *(include if feature involves data)*

- **Public API contract**: The versioned request, response, and error shapes that
  may cross between the browser and server.
- **Browser project**: The independently runnable application that presents and
  updates the game for the player.
- **Server project**: The independently runnable application that protects secrets
  and validates external-facing requests.
- **Capability status**: A safe public indication of whether a server-dependent
  feature can currently serve a request.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A reviewer can start the two applications from the documented
  quickstart and reach a playable game in under five minutes on a prepared local
  environment.
- **SC-002**: All existing deterministic game tests and all server contract tests
  pass without requiring a live provider or provider credit.
- **SC-003**: Each application completes its own typecheck and production build
  successfully.
- **SC-004**: Inspection of the browser production output finds zero occurrences of
  the configured test credential.
- **SC-005**: The combined local-development smoke test completes with a playable
  game and one verified safe server-unavailable response.

## Assumptions

- The project remains a single repository containing two independently runnable
  applications; shared contract definitions may be stored in a small shared area.
- The current game rules and current user-visible behavior are the compatibility
  baseline for this feature; the visual redesign is deferred to Feature 003.
- The current hint endpoint is preserved only as a contract seam. Replacing its
  provider and adding the required deterministic tool are deferred to Feature 004.
- No deployment, account system, persistence, or new gameplay mechanics are part of
  this feature.

# Research: Gemini Coach and Read-Only Game State Tool

## Decision: Use a manual two-turn Gemini function-calling exchange

**Rationale**: Gemini function calling returns a proposed call that the application
must inspect and execute. The application can return the function response with the
matching call ID, then request the final answer. That matches the course requirement
that the model proposes a tool call while the application controls execution.

**Alternatives considered**:
- Sending game context directly in one text prompt: rejected because it cannot prove
  the required model-proposal, allowlist, zero-call negative path, or tool-result
  validation.
- Automatically binding a local function to an SDK helper: rejected because explicit
  validation and call-count evidence are clearer with a manual loop.
- Multiple tools: rejected by the feature specification and course Core scope.

**Sources**: [Gemini function calling](https://ai.google.dev/gemini-api/docs/generate-content/function-calling),
[GenerateContent function-call schema](https://ai.google.dev/api/generate-content).

## Decision: Declare and accept only get_game_state

**Rationale**: One function declaration with an exact detail enum provides a small
allowlist. The backend is the only execution authority. A deterministic tool builds
a minimized snapshot from prevalidated local context, so it cannot mutate game state
or access files, secrets, services, or arbitrary browser data.

**Alternatives considered**:
- Letting the model request player coordinates or arbitrary fields: rejected because
  arguments would exceed the bounded contract.
- Reading browser state directly from the model: rejected because the model has no
  authority and the browser context is untrusted until validated.
- Persistent saved games: rejected because the game has no persistence and the
  feature scope forbids it.

## Decision: Use structured JSON for the final HintResponse and validate it again

**Rationale**: Gemini supports JSON structured output, but model output remains
untrusted. The final validator enforces the exact text, action, urgency, and
no-extra-fields policy before the UI can use it.

**Alternatives considered**:
- Display raw text: rejected because the UI must not parse arbitrary text as a
  command and the assignment requires structured HintResponse.
- Trust SDK parsing alone: rejected because runtime public-contract validation is
  still required.

**Sources**: [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output).

## Decision: Configure one explicit Gemini model with no fallback

**Rationale**: GEMINI_MODEL selects one supported Gemini model for the environment;
the documented example is gemini-2.5-flash. Keeping it explicit avoids silently
changing model behavior and honors the single-provider/no-fallback boundary.

**Alternatives considered**:
- Provider or model fallback chain: rejected by the feature specification.
- A model-name latest alias: rejected because stable explicit model names are easier
  to review and reproduce.

**Source**: [Gemini models](https://ai.google.dev/gemini-api/docs/models).

## Decision: Fake first; retry only classified transient provider failures

**Rationale**: Local fakes produce repeatable success, rejection, malformed-output,
timeout, and cancellation evidence without a key. At most two total attempts and one
overall 30-second deadline prevent unbounded provider use. The error classifier treats
network failures, HTTP 429, and HTTP 5xx as transient; invalid/auth/policy/malformed
outcomes are final.

**Alternatives considered**:
- Live provider tests for every case: rejected because they are non-deterministic,
  spend quota, and cannot establish negative call counts.
- Retrying all failures: rejected because invalid calls and authentication failures
  cannot recover through retry.


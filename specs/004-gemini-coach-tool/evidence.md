# Evidence: Gemini Coach and Read-Only Game State Tool

**Date**: 2026-09-30
**Branch**: 004-gemini-coach-tool
**Scope**: One backend-only Google Gemini provider, one model-callable read-only
get_game_state tool, structured HintResponse validation, and fake-first proof.

## Controlled success flow

The backend fake-flow test proves this sequence:

~~~text
valid browser context
  → Gemini fake proposes get_game_state with { detail: "summary" }
  → backend validates name and exact arguments
  → deterministic tool executes once and returns a validated minimal snapshot
  → Gemini fake receives that snapshot and returns HintResponse
  → backend validates and exposes the public response
~~~

Assertions prove one tool call, one final-model call, exact tool arguments, a
validated HintResponse, and a redacted event containing only requestId, operation,
status, latencyMs, and attempts.

## Negative and failure proof

Local fake tests prove:

| Scenario | Result |
|---|---|
| Unsupported/missing/additional/wrong-type tool arguments | INVALID_TOOL; zero tool calls and no final-model call |
| Direct answer, zero proposals, or multiple proposals | INVALID_TOOL; zero tool calls |
| Malformed tool snapshot | MALFORMED_OUTPUT; no final-model call |
| Malformed final HintResponse | MALFORMED_OUTPUT; no successful hint |
| Transient proposal failure | One retry, then one tool execution |
| Transient final-answer failure | One retry using the same snapshot; one tool execution total |
| Non-transient provider failure | Safe unavailable result; no retry |
| Missing Gemini key | Stable configuration error; provider is not called |
| In-flight cancellation | CANCELLED; no retry |
| Overall deadline expiry | Stable unavailable result; no retry after expiry |

## Automated validation

~~~powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
npm.cmd audit --omit=dev --workspace @quattro-kong/backend
~~~

Actual results:

- Full test suite: 75 passed: 55 frontend, 16 backend, and 4 shared-contract tests.
- Typecheck: passed across frontend, backend, and shared contracts.
- Production build: passed.
- Production dependency audit: 0 vulnerabilities.

## Local browser smoke

The combined development server was started without GEMINI_API_KEY.

1. Started a normal game and reached the hazard route.
2. A real collision reduced lives from 03 to 02 and enabled Get a recovery hint.
3. Selected Get a recovery hint.
4. The game remained in Session: Playing and displayed: AI coach is unavailable right now.
5. No JavaScript exception was observed. DevTools recorded the expected HTTP 503 resource
   response for the intentionally unconfigured server.

## Provider and review limitation

No live Gemini request was run because no GEMINI_API_KEY was supplied. This is an
intentional Core limitation: local fakes are the repeatable evidence path. The
Gemini adapter has a fake-client test that verifies its one function declaration,
two-turn exchange, structured-output request, and that the server key is not sent in
the request payload.

**Driver contribution**: Feature contract implementation, local tests, workspace
validation, and smoke test recorded above.
**Observer contribution**: Pending pair review before final course demonstration.

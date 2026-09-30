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
status, latencyMs, and attempts. The server also retains a bounded in-memory history
of the same redacted events for local inspection; it stores no payload or provider text.

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

- Full test suite: 76 passed: 55 frontend, 17 backend, and 4 shared-contract tests.
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

## Live provider verification

With a locally configured GEMINI_API_KEY and gemini-3.5-flash-lite, a real backend
POST returned HTTP 200 with a valid structured HintResponse. The running browser
then made the same request through the Vite /api/hint proxy and received HTTP 200,
a non-empty hint, a valid suggested action, and a valid urgency.

This check found and fixed Gemini 3 thought-signature handling: the adapter now
returns the full signed model tool turn with the function response. The signature
remains provider-only; the validated public tool proposal and response contracts do
not expose it. The fake-client test verifies that preserved turn alongside the one
function declaration, two-turn exchange, structured-output request, and absence of
the server key from request payloads.

**Driver contribution**: Feature contract implementation, local tests, workspace
validation, and smoke test recorded above.
**Observer contribution**: Pending pair review before final course demonstration.

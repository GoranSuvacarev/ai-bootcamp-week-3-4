# Implementation Plan: Gemini Coach and Read-Only Game State Tool

**Branch**: 004-gemini-coach-tool | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from /specs/004-gemini-coach-tool/spec.md

## Summary

Replace the existing direct OpenAI call with a server-only Google Gemini adapter and
a controlled, two-turn AI Hint flow. Gemini first receives one declared
get_game_state function and may propose that single call. The backend validates the
proposal, calls a deterministic read-only game-state tool against validated local
round context, validates the snapshot, returns it to Gemini, then validates the
structured HintResponse before returning it to the browser. Local fake
collaborators prove all success, rejection, failure, retry, cancellation, and
telemetry paths without a provider key.

## Technical Context

**Language/Version**: Browser TypeScript 5.9; backend and contracts use modern Node.js ES modules

**Primary Dependencies**: Vite, Vitest, Node HTTP, Google GenAI JavaScript SDK added only to backend

**Storage**: None; one request uses bounded in-memory context and emits redacted in-memory/test-observable events

**Testing**: Vitest unit and HTTP integration tests with fake Gemini and tool adapters; workspace typecheck/build; browser smoke through the existing dev proxy

**Target Platform**: Modern browser frontend and local Node.js backend

**Project Type**: Separated web application with frontend, backend, and shared contract workspace

**Performance Goals**: A completed local fake flow returns promptly; a real request has one finite 30-second overall deadline and at most two total provider attempts

**Constraints**: Exactly one read-only tool; no provider key in browser; no raw provider output; validation at browser request, tool proposal, tool result, and final result; retries only for transient provider conditions; no fallback model/provider

**Scale/Scope**: One AI Hint button after a collision, one configured Gemini model, one deterministic snapshot tool, one public endpoint, and no persistent state

## Constitution Check

| Gate | Result | Evidence |
|---|---|---|
| Bounded feature scope | Pass | The design adds only the Session 4 AI Hint flow, get_game_state, provider adapter, validation, tests, and evidence artifacts. |
| Specification before implementation | Pass | The corrected specification and checked quality list define the one tool, data boundaries, failure behavior, and measurable results. |
| Deterministic core and testable contracts | Pass | Game rules remain unchanged. The snapshot tool and orchestrator are deterministic with fakes; HTTP contracts validate all untrusted inputs and outputs. |
| Evidence-driven changes | Pass | The quickstart requires a success case, zero-call negative cases, failure/cancellation cases, workspace checks, and browser smoke evidence. |
| Human review and trusted boundaries | Pass | Backend owns Gemini credentials, tool authorization, retries, cancellation, and redacted events. The browser is never an authority. |

Post-design review: pass. The design adds no unapproved provider, tool, write action,
persistence, account, or autonomous behavior.

## Project Structure

### Documentation

~~~text
specs/004-gemini-coach-tool/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── hint-api.md
│   └── tool-contract.md
└── tasks.md
~~~

### Source Code

~~~text
backend/
├── package.json                         # Adds the Google GenAI SDK
├── src/
│   ├── index.mjs
│   ├── hint.mjs                         # HTTP adapter and dependency assembly
│   └── coach/
│       ├── hint-flow.mjs                # Proposal → tool → final-response orchestration
│       ├── game-state-tool.mjs          # Sole deterministic read-only tool
│       ├── gemini-adapter.mjs           # Google Gemini SDK boundary
│       ├── validation.mjs               # Strict proposal/snapshot/final validators
│       └── telemetry.mjs                # Redacted request event sink
└── tests/
    ├── hint-server.test.mjs
    └── hint-flow.test.mjs

packages/game-contracts/
├── src/hint.mjs                         # Browser request and public response validation
└── tests/hint.test.mjs

frontend/
└── src/main.ts                           # Existing request cancellation and safe UI mapping
~~~

**Structure Decision**: Keep the browser presentation layer thin. It sends the
existing bounded hint context and displays only a validated public result. Backend
coach modules isolate provider-specific SDK code from deterministic policy,
validation, and test fakes. Shared contracts remain the source for browser-to-server
request and public response shapes.

## Implementation Approach

1. Extend shared contracts with strict public success/error envelopes and browser
   request validation. The browser's context remains untrusted until backend
   validation.
2. Build game-state tool policy: accept only a tool proposal named get_game_state
   with one allowed detail value; generate a minimal snapshot from validated local
   context; validate that snapshot before it can return to the model.
3. Build a provider-neutral hint-flow orchestrator. It requires one valid tool
   proposal, rejects direct/unknown/invalid proposals without tool execution, sends
   the validated function result back once, validates the final HintResponse, and
   maps all public errors safely.
4. Implement the Gemini SDK adapter with one function declaration and a two-turn
   manual function-calling exchange. Configure the second turn for JSON output,
   parse it, and leave the final validator as the security boundary.
5. Add timeout, AbortSignal propagation, classified transient retry with two total
   attempts, request IDs, and redacted event recording. Retry only provider network,
   rate-limit, and server failures; do not retry invalid data, authorization,
   cancellation, malformed responses, or configuration failure.
6. Rewire the HTTP server through the flow and update the frontend to show a stable
   generic unavailable message instead of server/provider text.
7. Add fake-first tests and execute the quickstart matrix. A provider-key smoke test
   is optional and records only safe observations.

## Complexity Tracking

No constitution violations or complexity exceptions are required.


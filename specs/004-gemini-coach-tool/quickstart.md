# Quickstart: Gemini Coach and Read-Only Game State Tool

## Prerequisites

- Node.js and project dependencies installed with npm.cmd install.
- No Gemini credential is required for automated tests.
- Optional live smoke setup: set GEMINI_API_KEY and GEMINI_MODEL in the backend
  process environment. Do not commit either value.

## Local verification

1. Run focused backend and shared-contract tests:

~~~powershell
npm.cmd run test --workspace @quattro-kong/game-contracts
npm.cmd run test --workspace @quattro-kong/backend
~~~

Expected: fake success, invalid input, unsupported tool, invalid tool arguments,
malformed tool output, malformed final output, transient retry, timeout, and
cancellation cases pass. No test contacts Gemini.

2. Run all workspace checks:

~~~powershell
npm.cmd run test
npm.cmd run typecheck
npm.cmd run build
~~~

Expected: all workspaces pass.

3. Start the local application:

~~~powershell
npm.cmd run dev
~~~

Open the printed frontend URL. Start a game, lose a life, and select Ask AI for
Hint. With no key, the defined unavailable message appears and the game remains
playable. Restart/menu/new damage must cancel and suppress an older pending hint.

4. Optional limited Gemini smoke:

~~~powershell
$env:GEMINI_API_KEY = "your key"
$env:GEMINI_MODEL = "gemini-2.5-flash"
npm.cmd run dev
~~~

Repeat one post-collision hint request. Record only the public result and redacted
event fields from [hint-api.md](./contracts/hint-api.md); never record the key or raw
provider response.

## Evidence matrix

| Scenario | Required observation |
|---|---|
| Valid fake flow | one valid proposal, one tool call, valid snapshot/final hint, safe event |
| Invalid tool arguments | zero tool calls |
| Unsupported tool | zero tool calls |
| Malformed tool output | no final model call and no successful hint |
| Malformed final output | no successful hint |
| Provider timeout/transient failure | finite attempts and safe unavailable result |
| Cancellation | no retry after abort and no stale UI hint |

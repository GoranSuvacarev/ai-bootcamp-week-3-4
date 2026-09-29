# AI Bootcamp Week 3

Retro AI Engineering Challenge — Session 003.

This project was developed with GitHub Spec Kit and the Codex integration. Session
003 implementation and evidence are complete. The current next step is human
review and instructor approval of the documented title/originality risk before
submission.

## Current scope

- one small retro-inspired browser game;
- structured game configuration or state with runtime validation;
- baseline and four repeatable eval cases;
- one hypothesis-driven controlled change;
- evidence and AI usage documentation.
- an optional AI coach that gives a hint after a lost life.

## Session 003 validation

- `npm.cmd test` — 42 tests passing;
- `npm.cmd run typecheck` — passing;
- `npm.cmd run build` — passing;
- browser smoke evidence — recorded in `docs/EVALS.md` and `docs/EVIDENCE_003.md`;
- requirements quality checklist — 20/20 items checked.
- handoff package — `docs/SESSION_003_HANDOFF.md`.

## AI coach (local development)

Set `OPENAI_API_KEY` in the server's environment, then run `npm.cmd run dev`.
On PowerShell, for example:

```powershell
$env:OPENAI_API_KEY = "<your API key>"
npm.cmd run dev
```

The command starts both Vite and the local hint API. The **Get hint** button
becomes available after losing a life. Each click sends the last hit and the
selected difficulty to the API; the server asks the model for one short hint.
The default model is `gpt-5-mini`; set `OPENAI_MODEL` on the server to override it.
Without a key, the game still runs and the hint panel reports that the coach
is not configured. The key must not be placed in a `VITE_` variable or browser
code. For a deployed build, route `/api/hint` to the Node API (`npm.cmd run api`).

## Spec Kit workflow

Run the project-specific Codex skills from this directory:

```text
$speckit-constitution
$speckit-specify
$speckit-clarify
$speckit-plan
$speckit-checklist
$speckit-tasks
$speckit-analyze
$speckit-implement
$speckit-converge
```

The authoritative project rules are in `.specify/memory/constitution.md`.

## Handoff status

The Session 003 handoff remains a historical record. The AI coach is a later
working-tree addition; it has not been added to the Session 003 evidence.

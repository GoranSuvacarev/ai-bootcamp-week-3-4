# Quattro Kong Constitution

## Core Principles

### I. Bounded Feature Scope

The project MUST deliver one reviewed feature at a time. Each feature MUST have a
clear user value, a finite Definition of Done, explicit dependencies, and a scope
boundary. The Session 003 game core remains a compact, single-player browser game.

Session 004 may add a separated backend, one read-only tool boundary, and one
server-side AI hint provider. Multiplayer, accounts, deployment, online
leaderboards, write operations, provider routing, autonomous loops, and additional
tools remain out of scope unless a later amendment explicitly authorizes them.

### II. Specification Before Implementation

The team MUST define the game goal, controls, loop, win/lose rules, visual minimum,
out-of-scope items, and Definition of Done before the first major coding-agent
implementation. The specification, plan, tasks, and implementation MUST remain
consistent.

### III. Testable Contracts and Deterministic Core

The game core MUST remain deterministic and independently testable without a
network connection. Important game configuration and state shapes MUST have
documented valid and invalid examples, runtime validation, and defined safe behavior
for invalid input. TypeScript compile-time types alone are not runtime validation.

Every client-server or tool contract MUST validate input before an external call,
validate output before it becomes application data, and return stable public success
or error shapes. A valid request outside its permitted scope MUST be rejected before
the external call.

### IV. Evidence-Driven Changes

The team MUST preserve a baseline, run at least four predefined eval cases, identify
one real baseline problem, state a hypothesis, make one controlled change, and run
the same eval cases before and after the change. Generated output MUST NOT be
manually altered to make results appear better.

### V. Human Review and Trusted Boundaries

The driver may write prompts and change code. The observer MUST review scope,
context, plans, diffs, commands, and results at each major checkpoint. AI usage MUST
be recorded without storing private chain-of-thought, credentials, or unnecessary
private data.

Browser code MUST never contain provider credentials or be trusted to authorize a
tool request. The backend MUST own provider credentials, trusted context, allowlists,
timeout and retry decisions, and safe telemetry. Unclear external tool contracts
MUST stop implementation at the contract boundary rather than be silently invented.

## Session 004 Technical and Security Constraints

- Use a minimal TypeScript browser application with Canvas/HTML/CSS unless the team
  explicitly approves another approach.
- Do not add secrets, API keys, credentials, environment dumps, private URLs, or
  unnecessary user data to prompts, source, screenshots, or evidence.
- The frontend and backend MUST be separate projects with independently runnable
  development, test, typecheck, and build commands.
- The only live AI provider permitted by this amendment is Google Gemini, accessed
  through a server-side adapter using a server environment variable.
- The Week 4 Core path MUST use exactly one deterministic, read-only tutor-provided
  tool or fixture. It MUST enforce its contract, allowed scope, bounded timeout,
  retry policy, output validation, stable public errors, and safe telemetry with a
  request identifier.
- Live-provider behavior is supplementary to the deterministic Core path. Tests and
  evidence MUST use local fakes or fixtures and MUST NOT require provider credits.
- Prefer local deterministic tests and fixtures over network-dependent checks.
- Game assets and visual design MUST be original. The redesign MUST preserve playable
  controls, accessible focus behavior, and deterministic game rules.
- Keep changes limited to the current feature and named task scope; avoid unrelated
  refactors.

## Development Workflow

The project follows this Spec Kit sequence for each feature:

```text
constitution -> specify -> clarify -> plan -> checklist -> tasks
-> analyze -> implement -> converge
```

Implementation tasks MUST follow a red-green-refactor rhythm where practical: write
a meaningful failing check, make the smallest coherent change, then run the focused
check and relevant regression checks. The observer reviews before a major scope
transition and before evidence is accepted.

Spec Kit workflow artifacts may be committed at phase boundaries. Each commit MUST
stage only the current workflow artifact and MUST preserve unrelated uncommitted
work. A feature may proceed to planning only after its specification quality
checklist is complete; a feature may proceed to implementation only after its plan,
tasks, and dependency gates are reviewed.

## Governance

This constitution is the project-level authority for scope, evidence, review, and
security. Amendments require a recorded reason, an updated version and date, and a
review by both pair members. A major version removes or reverses a principle, a
minor version adds or materially expands a principle, and a patch version clarifies
wording without changing project behavior.

Version 2.0.0 authorizes the Session 004 work as three separately specified
features: client-server separation, game-experience redesign, and the bounded
tool/Gemini coach. Any conflict with the course challenge brief or missing
tutor-provided tool contract MUST be surfaced for human resolution rather than
silently overridden.

**Version**: 2.0.0 | **Ratified**: 2026-09-22 | **Last Amended**: 2026-09-29

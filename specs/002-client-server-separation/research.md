# Research: Client-Server Separation

## Decision: Use npm workspaces in one repository

**Rationale**: The feature requires independently runnable frontend and backend
projects without splitting Git history or duplicating dependencies. Workspaces retain
one lockfile and give each project its own scripts.

**Alternatives considered**:

- Two separate repositories: rejected because this migration needs an atomic,
  reviewable compatibility change.
- Keep the current mixed `src/` and `server/` directories: rejected because the
  ownership boundary remains unclear and cannot be verified independently.

## Decision: Put only public API declarations in a shared package

**Rationale**: Request and response shapes need one source of truth. A minimal
contract package lets browser and server validate the same public vocabulary without
sharing secrets, provider behavior, or mutable game state.

**Alternatives considered**:

- Duplicate types in browser and server: rejected because the boundary can drift.
- Share server code with the browser: rejected because it risks bundling protected
  configuration and authority into browser output.

## Decision: Preserve `/api/hint` and its safe behavior during migration

**Rationale**: The existing endpoint is the only public server seam. Retaining it
keeps the migration bounded and gives Feature 004 a stable place to replace the
provider and add the deterministic tool.

**Alternatives considered**:

- Replace OpenAI with Gemini now: deferred to Feature 004.
- Add a status endpoint or second API: rejected because the feature requires no new
  public capability.

## Decision: Keep deterministic game rules in the frontend

**Rationale**: Movement, collisions, scoring, and rendering must remain runnable and
testable without a server, network, or provider credential.

**Alternatives considered**:

- Move game rules to the server: rejected because it changes the gameplay model and
  adds latency without meeting a Feature 002 requirement.

## Decision: Use a root development supervisor only for local convenience

**Rationale**: A root command can start both projects and stop the paired process on
failure, while each application retains a direct independent run command.

**Alternatives considered**:

- Require two terminal windows: valid but does not satisfy the requested combined
  local-development entry point.

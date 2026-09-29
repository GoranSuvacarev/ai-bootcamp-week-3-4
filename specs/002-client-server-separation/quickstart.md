# Quickstart: Client-Server Separation Validation

## Prerequisites

- Node.js and npm installed.
- Repository dependencies installed from the repository root.
- No provider credential is required for deterministic checks.

## Independent checks

Run the frontend checks from the repository root:

```powershell
npm.cmd run typecheck --workspace @quattro-kong/frontend
npm.cmd run test --workspace @quattro-kong/frontend
npm.cmd run build --workspace @quattro-kong/frontend
```

Run the backend checks separately:

```powershell
npm.cmd run typecheck --workspace @quattro-kong/backend
npm.cmd run test --workspace @quattro-kong/backend
npm.cmd run build --workspace @quattro-kong/backend
```

Expected result: every command completes successfully without starting the other
application or making a live provider call.

## Combined local smoke test

```powershell
npm.cmd run dev
```

1. Open the documented frontend local address.
2. Start a game and verify movement, HUD, collision, and difficulty behavior.
3. Trigger a collision and request a hint with no provider credential configured.
4. Confirm the game stays playable and presents the safe unavailable message.
5. Stop the root command and confirm neither development process remains running.

## Credential-boundary check

Build the frontend using a distinctive test-only server credential. Search the
frontend production output for that value. Expected result: zero matches.

Do not record a real credential in command output, source, screenshots, or evidence.

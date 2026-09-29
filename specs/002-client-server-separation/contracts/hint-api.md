# Hint API Contract v1

## Purpose

The browser asks the server for one short game hint after a recorded collision. This
contract is the only browser-to-server interface moved in Feature 002.

## Request

`POST /api/hint`

The request body is JSON with exactly these public fields:

```ts
type HintRequest = {
  difficulty: "easy" | "normal";
  lives: number;
  lastDamage: {
    cause: "hazard" | "enemy";
    x: number;
    y: number;
    time: number;
  };
};
```

The browser supplies only this bounded snapshot. Credentials, provider selection,
model names, authorization data, and full `GameState` are not accepted.

## Responses

Success:

```ts
type HintSuccess = { hint: string };
```

Safe failure:

```ts
type PublicApiError = {
  error: {
    code: "INVALID_REQUEST" | "NOT_FOUND" | "METHOD_NOT_ALLOWED" | "COACH_UNAVAILABLE";
    message: string;
  };
};
```

The message is safe for a player. It never includes credentials, private URLs, raw
provider payloads, hidden game state, or a stack trace.

## Boundary rules

- Only JSON `POST` requests to `/api/hint` are accepted.
- Invalid content type, malformed JSON, oversized input, unsupported fields, and
  invalid values are rejected before the provider seam is called.
- The server owns provider configuration and may report `COACH_UNAVAILABLE` when it
  is absent or an upstream request fails.
- This contract does not define the Week 4 deterministic tool; Feature 004 extends
  the backend after its tutor contract is available.

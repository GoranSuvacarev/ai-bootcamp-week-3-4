# Data Model: Client-Server Separation

## Ownership model

| Entity | Owner | Notes |
| --- | --- | --- |
| `GameState` | Frontend | Deterministic in-memory state; never sent in full to the server. |
| `HintSnapshot` | Shared contract | Bounded facts required for the existing hint request. |
| `HintRequest` | Shared contract | Contains exactly one `HintSnapshot`; unknown fields are rejected. |
| `HintSuccess` | Shared contract | Contains one bounded public hint string. |
| `PublicApiError` | Shared contract | Contains a stable code and safe message, never a stack trace or raw provider data. |
| Provider credential | Backend | Environment-only value; never part of a contract or browser bundle. |

## Hint snapshot validation

| Field | Rule |
| --- | --- |
| `difficulty` | One supported public difficulty value. |
| `lives` | Integer from 0 through the configured maximum. |
| `lastDamage.cause` | One supported public collision cause. |
| `lastDamage.x`, `lastDamage.y` | Finite values inside the current level bounds. |
| `lastDamage.time` | Finite value greater than or equal to zero. |

Unknown top-level and nested fields are rejected at the public boundary. The server
may derive internal context, but it does not trust browser-owned authority.

## Public response states

| State | Public code | Required fields |
| --- | --- | --- |
| Success | none | `hint` |
| Invalid request | `INVALID_REQUEST` | `error.code`, `error.message` |
| Unsupported request | `NOT_FOUND` or `METHOD_NOT_ALLOWED` | `error.code`, `error.message` |
| Missing provider configuration | `COACH_UNAVAILABLE` | `error.code`, `error.message` |
| Upstream failure | `COACH_UNAVAILABLE` | `error.code`, `error.message` |

Feature 004 may extend this model with request IDs, tool-specific authorization,
retry, cancellation, and Gemini-specific internal adapter results.

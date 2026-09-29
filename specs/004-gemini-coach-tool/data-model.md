# Data Model: Gemini Coach and Read-Only Game State Tool

## Browser HintRequest

| Field | Type | Rules |
|---|---|---|
| difficulty | string | Exactly easy or normal. |
| lives | integer | 0 through 3. |
| lastDamage.cause | string | Exactly hazard or enemy. |
| lastDamage.x, lastDamage.y | finite numbers | Within the fixed level bounds. |
| lastDamage.time | finite number | Zero or greater. |

Unknown fields, wrong types, missing fields, and oversized bodies are invalid before
any provider or tool call.

## ToolProposal

| Field | Type | Rules |
|---|---|---|
| id | string | Non-empty provider call identifier. |
| name | string | Must exactly equal get_game_state. |
| args.detail | string | Must exactly equal summary or tactical. |

The validator rejects a direct model answer, zero/multiple proposals, extra
arguments, unknown names, and malformed identifiers. Rejection means zero tool calls.

## GameStateSnapshot

| Field | Type | Rules |
|---|---|---|
| difficulty | string | Copied from validated context. |
| lives | integer | Copied from validated context. |
| recentThreat | string | rolling_hazard or patrol_enemy, derived from cause. |
| nearbyObjects | array | At most three known non-mutable object summaries. |
| detail | string | summary or tactical, copied from the validated proposal. |

The tool owns this shape. It returns no raw browser object, coordinates, timestamps,
credential, environment field, file, source, or game command.

## HintResponse

| Field | Type | Rules |
|---|---|---|
| hint | string | Trimmed, non-empty, actionable, maximum 300 characters. |
| suggestedAction | string | move_left, move_right, jump, climb, wait, or avoid. |
| urgency | string | low, medium, or high. |

It has exactly these fields. The UI only renders hint text; it never executes
suggestedAction.

## Public result and event

A public success has a HintResponse. A public error has one stable code/message
envelope. Each request emits a redacted event:

| Field | Meaning |
|---|---|
| requestId | Opaque generated correlation identifier. |
| operation | ai_hint. |
| status | success, invalid_input, invalid_tool, unavailable, malformed_output, or cancelled. |
| latencyMs | Non-negative elapsed milliseconds. |
| attempts | Total provider attempts, starting at one only after provider work starts. |

Events contain no request, snapshot, tool response, provider text, API key, or stack
trace.

## State transitions

~~~text
validated HintRequest
  → valid ToolProposal
  → validated GameStateSnapshot
  → validated HintResponse
  → public success

Any validation/provider/cancellation failure
  → mapped safe public error
  → redacted RequestEvent
~~~

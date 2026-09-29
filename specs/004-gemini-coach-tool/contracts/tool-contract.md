# Tool Contract: get_game_state

## Purpose

Return the minimum current-round facts that Gemini needs to produce an AI Hint.

## Access and authority

| Attribute | Contract |
|---|---|
| Name | get_game_state |
| Caller | Gemini only through the backend AI Hint flow |
| Read/write | Read only |
| Execution authority | Backend after validation |
| Call limit | Exactly one execution per accepted AI Hint request |

The model proposes the call. It never executes it. The browser does not authorize it.

## Input

~~~json
{ "detail": "summary" }
~~~

or

~~~json
{ "detail": "tactical" }
~~~

The input object must have exactly one property. Other names, fields, types, values,
zero calls, and multiple calls are rejected. Rejection executes the tool zero times.

## Output

~~~json
{
  "detail": "summary",
  "difficulty": "normal",
  "lives": 2,
  "recentThreat": "rolling_hazard",
  "nearbyObjects": [
    { "kind": "rolling_hazard", "relation": "nearby" },
    { "kind": "ladder", "relation": "next_route" }
  ]
}
~~~

The tool derives this result from a validated local HintRequest and fixed game rules.
The backend validates the exact output shape before returning it to Gemini.

## Must not return

- API keys, environment variables, files, source code, logs, or stack traces.
- The raw browser request, coordinates, timestamps, arbitrary page data, or hidden
  application state.
- A command that can move the player, alter lives/score/configuration, reset the
  game, spawn objects, call a second tool, or write anywhere.

## Failure policy

Invalid model proposal: no tool call and stable invalid-tool error.
Malformed deterministic snapshot: no model continuation and stable malformed-output
error. Cancellation: stop processing and do not start another retry.


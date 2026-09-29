# AI Hint HTTP Contract

## Request

POST /api/hint
Content-Type: application/json

~~~json
{
  "difficulty": "normal",
  "lives": 2,
  "lastDamage": {
    "cause": "hazard",
    "x": 160,
    "y": 640,
    "time": 4.5
  }
}
~~~

The request body is bounded and has no additional properties.

## Success response

HTTP 200

~~~json
{
  "hint": "Wait for the rolling hazard to pass, then climb the right ladder.",
  "suggestedAction": "wait",
  "urgency": "medium"
}
~~~

## Public error response

HTTP 400, 499, 502, or 503 depending on the class of public failure.

~~~json
{
  "error": {
    "code": "COACH_UNAVAILABLE",
    "message": "AI coach is unavailable right now."
  }
}
~~~

The public code/message is stable and does not contain provider payloads, credentials,
stack traces, or internal tool details. The UI maps all non-success responses to a
defined safe message and ignores aborted/stale requests.

## Cancellation

The browser may abort the request. Restart, return to menu, and new damage abort the
active request and suppress its eventual response in the UI.

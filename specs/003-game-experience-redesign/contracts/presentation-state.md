# Presentation-State Contract

This internal frontend contract defines the pure state transition boundary used by
the game shell. It does not change the HTTP API.

## Valid state examples

```ts
{ view: "menu", difficulty: "normal" }
{ view: "playing", difficulty: "easy" }
{ view: "paused", difficulty: "normal" }
{ view: "won", difficulty: "easy" }
{ view: "lost", difficulty: "normal" }
```

## Transition examples

| Current state | Action | Next state | Session effect |
|---------------|--------|------------|----------------|
| `{ view: "menu", difficulty: "easy" }` | `start` | `{ view: "playing", difficulty: "easy" }` | Create fresh easy game. |
| `{ view: "playing", difficulty: "normal" }` | `pause` | `{ view: "paused", difficulty: "normal" }` | Retain current game unchanged. |
| `{ view: "paused", difficulty: "normal" }` | `resume` | `{ view: "playing", difficulty: "normal" }` | Continue same game. |
| `{ view: "won", difficulty: "easy" }` | `restart` | `{ view: "playing", difficulty: "easy" }` | Create fresh easy game. |
| `{ view: "lost", difficulty: "normal" }` | `quitToMenu` | `{ view: "menu", difficulty: "normal" }` | Discard game and retain selection. |

## Invalid/no-op examples

| Current state | Action | Required result |
|---------------|--------|-----------------|
| `menu` | `pause` | Remain in `menu`; do not create or mutate a game. |
| `paused` | `gameWon` | Remain in `paused`; outcome is only accepted from active play. |
| `won` | `pause` | Remain in `won`; no second overlay appears. |
| `playing` | `selectDifficulty` | Retain current state; the running game difficulty cannot be changed. |

## Integration obligations

- Session-creating actions call `createInitialGameState` with a configuration whose
  difficulty is the contract state’s selected value.
- Entering or leaving `playing` resets input and the frame timing boundary.
- Only `playing` invokes `updateGame`.
- An active hint request is aborted when its session is discarded or restarted.

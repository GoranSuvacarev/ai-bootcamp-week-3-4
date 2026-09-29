# Data Model: Game Experience Redesign

## PresentationState

The frontend owns this state. It is independent of `GameState` and has no network or
persistent representation.

| Field | Type | Valid values | Meaning |
|-------|------|--------------|---------|
| `view` | union | `menu`, `playing`, `paused`, `won`, `lost` | The sole visible presentation mode. |
| `difficulty` | `Difficulty` | `easy`, `normal` | Difficulty used when the next session starts or restarts. |

### Invariants

- Exactly one `view` is active.
- `menu` has no active game session.
- `playing` and `paused` refer to one in-memory game session.
- `won` and `lost` are terminal views of the current session until Restart or Main
  Menu is selected.
- Restart creates a new `GameState` from the selected `difficulty`; it never mutates
  score, lives, player position, collectibles, or transient input from the old state.
- A state that is not `playing` must never advance the deterministic simulation.

## PresentationAction

| Action | Valid source views | Result |
|--------|--------------------|--------|
| `selectDifficulty` | `menu` | Keeps `menu`; changes the next-session difficulty. |
| `start` | `menu` | Creates a fresh state and enters `playing`. |
| `pause` | `playing` | Enters `paused`; leaves `GameState` untouched. |
| `resume` | `paused` | Returns to `playing` with the same `GameState`. |
| `restart` | `paused`, `won`, `lost` | Creates a fresh state and enters `playing`. |
| `quitToMenu` | `paused`, `won`, `lost` | Discards the session and enters `menu`. |
| `gameWon` | `playing` | Enters `won` after engine state reports `phase: won`. |
| `gameLost` | `playing` | Enters `lost` after engine state reports `phase: lost`. |

Actions from other views are no-ops. The DOM should not expose invalid actions, but
the pure reducer retains that safe behavior for programmatic callers and tests.

## GameState integration

`GameState` remains the existing deterministic engine model. Feature 003 does not
add fields or alter its validation. `main.ts` owns the pairing:

```text
PresentationState(view: playing) + GameState
             | each animation frame
             v
updateGame(GameState, input, elapsed)
             | phase won/lost
             v
PresentationState(view: won/lost) + final GameState
```

When `view` is `menu`, no `GameState` is considered an active session. When it is
`paused`, `won`, or `lost`, the final in-memory state may be rendered but is not
updated.

# Research: Game Experience Redesign

## Decision: Separate presentation state from deterministic game phase

- **Decision**: Add a frontend-only presentation state machine with `menu`,
  `playing`, `paused`, `won`, and `lost`. Continue deriving win/loss transitions
  from `GameState.phase` after each game update.
- **Rationale**: `GameState.phase` describes simulation conditions (`ready`,
  `playing`, `won`, `lost`). Menus and pause are browser presentation concerns.
  A separate pure model prevents UI actions from weakening deterministic rule tests
  or introducing DOM logic into the engine.
- **Alternatives considered**:
  - Add `menu` and `paused` to `GamePhase`: rejected because it couples UI choices
    to the core simulation shape and complicates existing rules tests.
  - Use booleans such as `isMenuOpen` and `isPaused`: rejected because mutually
    exclusive combinations can become invalid and are harder to cover exhaustively.

## Decision: Keep one persistent animation-frame callback

- **Decision**: Schedule a single frame callback for the page lifecycle. Render on
  every callback, but call `updateGame` only when presentation state is `playing`.
  Set the previous timestamp to `undefined` when leaving or re-entering play.
- **Rationale**: This guarantees pause freezes simulation and avoids duplicate loops
  after repeated Restart actions. Resetting the timestamp prevents a large elapsed
  time from being applied after pause/menu time.
- **Alternatives considered**:
  - Cancel and recreate animation loops for each state: rejected because repeated
    actions can accidentally leave more than one loop alive.
  - Continue updating with `dt = 0`: rejected because the code path is less explicit
    and does not establish a clean resume timestamp boundary.

## Decision: Render a selected licensed 32x32 tile-art subset

- **Decision**: Use user-owned Modern Exteriors tiles for the level and character
  sprites, and Modern UI Style 2 for visual panel treatment. Retain semantic HTML
  controls and CSS focus states above the decorative assets.
- **Rationale**: The selected native 32x32 sheets create a coherent city scene and
  crisp sprites at the game’s logical scale. Their limited import keeps the project
  small and preserves the current collision geometry. Modern UI requires credit, so
  an attribution file and in-game credit are part of the feature.
- **Alternatives considered**:
  - Import the complete Modern Exteriors pack: rejected because it includes more than
    13,000 files, most of which are unused by this level.
  - Keep code-drawn scenery: rejected because it does not meet the requested visual
    quality target.

## Decision: Use native accessible controls for session actions

- **Decision**: Put menu, pause, restart, quit, and difficulty choices in semantic
  HTML buttons and radio inputs, with CSS `:focus-visible` styles and panel visibility
  controlled through standard hidden/inert behavior as appropriate.
- **Rationale**: Native controls provide keyboard navigation, activation, and screen
  reader semantics without implementing a custom Canvas focus system.
- **Alternatives considered**:
  - Draw clickable controls inside Canvas: rejected because keyboard focus and
    accessible labels would require significant custom interaction infrastructure.
  - Keep difficulty live during play: rejected because the spec requires each new or
    restarted session to use a selected difficulty and live mutation can create an
    unclear current session.

## Decision: Preserve the existing hint behavior within active play

- **Decision**: Keep the existing coach UI and abort an in-flight request when a
  session ends, restarts, or returns to menu. The Gemini/tool work remains Feature 004.
- **Rationale**: Feature 003 must not alter the backend/provider boundary, while the
  presentation lifecycle must not display a stale hint from a discarded session.
- **Alternatives considered**:
  - Remove the coach control: rejected because it would regress already integrated
    Feature 002 browser behavior.
  - Implement Gemini now: rejected because Feature 004 has its own scoped spec and
    its required tutor tool contract is still unavailable.

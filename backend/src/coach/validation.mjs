import { API_ERROR_CODES, publicError } from "@quattro-kong/game-contracts";

const PUBLIC_OUTCOMES = Object.freeze({
  [API_ERROR_CODES.INVALID_REQUEST]: { status: 400, message: "Invalid game state." },
  [API_ERROR_CODES.INVALID_TOOL]: { status: 502, message: "Invalid AI coach tool request." },
  [API_ERROR_CODES.MALFORMED_OUTPUT]: { status: 502, message: "AI coach returned an invalid response." },
  [API_ERROR_CODES.CANCELLED]: { status: 499, message: "AI coach request was cancelled." },
  [API_ERROR_CODES.COACH_UNAVAILABLE]: { status: 503, message: "AI coach is unavailable right now." },
});

export class HintFlowError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export function publicOutcome(code) {
  const outcome = PUBLIC_OUTCOMES[code] ?? PUBLIC_OUTCOMES[API_ERROR_CODES.COACH_UNAVAILABLE];
  return { status: outcome.status, body: publicError(code in PUBLIC_OUTCOMES ? code : API_ERROR_CODES.COACH_UNAVAILABLE, outcome.message) };
}

export function isCancellation(signal) {
  return signal?.aborted && signal.reason?.kind !== "deadline";
}

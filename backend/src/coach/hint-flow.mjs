import {
  API_ERROR_CODES,
  validateGameStateSnapshot,
  validateHintRequest,
  validateHintResponse,
  validateToolProposal,
} from "@quattro-kong/game-contracts";
import { createRequestEvent, isTransientProviderError } from "./telemetry.mjs";
import { HintFlowError, isCancellation, publicOutcome } from "./validation.mjs";

const MAX_STAGE_ATTEMPTS = 2;

function withAbort(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(signal.reason ?? new Error("aborted"));
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason ?? new Error("aborted"));
    signal.addEventListener("abort", onAbort, { once: true });
    Promise.resolve(promise).then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
  });
}

async function runStage(work, signal, counter) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_STAGE_ATTEMPTS; attempt += 1) {
    if (signal.aborted) throw signal.reason ?? new Error("aborted");
    counter.count += 1;
    try {
      return await withAbort(work(), signal);
    } catch (error) {
      lastError = error;
      if (signal.aborted || !isTransientProviderError(error) || attempt === MAX_STAGE_ATTEMPTS) throw error;
    }
  }
  throw lastError;
}

function createDeadlineSignal(parentSignal, deadlineMs) {
  const controller = new AbortController();
  const abortParent = () => controller.abort({ kind: "cancelled" });
  if (parentSignal) {
    if (parentSignal.aborted) abortParent();
    else parentSignal.addEventListener("abort", abortParent, { once: true });
  }
  const timer = setTimeout(() => controller.abort({ kind: "deadline" }), deadlineMs);
  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timer);
      parentSignal?.removeEventListener("abort", abortParent);
    },
  };
}
export function createHintFlow({ model, tool, eventSink = () => {}, deadlineMs = 30000, now = Date.now }) {
  return {
    async run(rawContext, { signal: parentSignal } = {}) {
      const startedAt = now();
      const attempts = { count: 0 };
      const deadline = createDeadlineSignal(parentSignal, deadlineMs);
      const finish = (status, outcome) => {
        eventSink(createRequestEvent({ status, attempts: attempts.count, startedAt, now }));
        return outcome;
      };

      try {
        const context = validateHintRequest(rawContext);
        if (!context) throw new HintFlowError(API_ERROR_CODES.INVALID_REQUEST);
        if (deadline.signal.aborted) throw deadline.signal.reason;

        const proposals = await runStage(
          () => model.propose({ context, signal: deadline.signal }),
          deadline.signal,
          attempts,
        );
        if (!Array.isArray(proposals) || proposals.length !== 1) throw new HintFlowError(API_ERROR_CODES.INVALID_TOOL);
        const proposal = validateToolProposal(proposals[0]);
        if (!proposal) throw new HintFlowError(API_ERROR_CODES.INVALID_TOOL);

        const snapshot = validateGameStateSnapshot(tool.getGameState(context, proposal.args));
        if (!snapshot) throw new HintFlowError(API_ERROR_CODES.MALFORMED_OUTPUT);

        const rawHint = await runStage(
          () => model.finalize({ context, proposal, snapshot, signal: deadline.signal }),
          deadline.signal,
          attempts,
        );
        const hint = validateHintResponse(rawHint);
        if (!hint) throw new HintFlowError(API_ERROR_CODES.MALFORMED_OUTPUT);

        return finish("success", { status: 200, body: hint });
      } catch (error) {
        if (error instanceof HintFlowError) {
          const outcome = publicOutcome(error.code);
          return finish(error.code.toLowerCase(), outcome);
        }
        if (isCancellation(deadline.signal)) {
          return finish("cancelled", publicOutcome(API_ERROR_CODES.CANCELLED));
        }
        return finish("unavailable", publicOutcome(API_ERROR_CODES.COACH_UNAVAILABLE));
      } finally {
        deadline.dispose();
      }
    },
  };
}

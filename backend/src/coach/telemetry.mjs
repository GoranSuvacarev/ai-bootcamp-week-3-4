import { randomUUID } from "node:crypto";

export function createRequestEvent({ requestId = randomUUID(), status, attempts, startedAt, now = Date.now }) {
  return {
    requestId,
    operation: "ai_hint",
    status,
    latencyMs: Math.max(0, now() - startedAt),
    attempts,
  };
}

export function isTransientProviderError(error) {
  const status = Number(error?.status ?? error?.statusCode);
  if (status === 429 || status >= 500) return true;
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "ENETUNREACH", "NETWORK_ERROR"].includes(error?.code);
}

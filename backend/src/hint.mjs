import { createServer } from "node:http";
import { API_ERROR_CODES, publicError, validateHintRequest } from "@quattro-kong/game-contracts";
import { createGeminiAdapter } from "./coach/gemini-adapter.mjs";
import { createGameStateTool } from "./coach/game-state-tool.mjs";
import { createHintFlow } from "./coach/hint-flow.mjs";

const MAX_BODY_BYTES = 2048;

export { validateHintRequest };

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) throw new Error("too-large");
  }
  return JSON.parse(body);
}

function createRequestSignal(request, response) {
  const controller = new AbortController();
  request.once("aborted", () => controller.abort({ kind: "cancelled" }));
  response.once("close", () => {
    if (!response.writableEnded) controller.abort({ kind: "cancelled" });
  });
  return controller.signal;
}

export function createHintServer({
  apiKey = process.env.GEMINI_API_KEY ?? "",
  model = process.env.GEMINI_MODEL || "gemini-2.5-flash",
  coach,
  tool = createGameStateTool(),
  eventSink = () => {},
} = {}) {
  const resolvedCoach = apiKey ? (coach ?? createGeminiAdapter({ apiKey, model })) : null;
  const flow = resolvedCoach ? createHintFlow({ model: resolvedCoach, tool, eventSink }) : null;

  return createServer(async (request, response) => {
    if (request.url !== "/api/hint") {
      sendJson(response, 404, publicError(API_ERROR_CODES.NOT_FOUND, "Not found."));
      return;
    }
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      sendJson(response, 405, publicError(API_ERROR_CODES.METHOD_NOT_ALLOWED, "Method not allowed."));
      return;
    }
    if (!request.headers["content-type"]?.startsWith("application/json")) {
      sendJson(response, 415, publicError(API_ERROR_CODES.INVALID_REQUEST, "Expected JSON."));
      return;
    }

    let raw;
    try {
      raw = await readBody(request);
    } catch (error) {
      sendJson(response, error.message === "too-large" ? 413 : 400, publicError(API_ERROR_CODES.INVALID_REQUEST, "Invalid request."));
      return;
    }
    const context = validateHintRequest(raw);
    if (!context) {
      sendJson(response, 400, publicError(API_ERROR_CODES.INVALID_REQUEST, "Invalid game state."));
      return;
    }
    if (!flow) {
      sendJson(response, 503, publicError(API_ERROR_CODES.COACH_UNAVAILABLE, "AI coach is not configured."));
      return;
    }

    const result = await flow.run(context, { signal: createRequestSignal(request, response) });
    sendJson(response, result.status, result.body);
  });
}

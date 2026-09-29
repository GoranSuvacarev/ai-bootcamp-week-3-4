import { createServer } from "node:http";
import { API_ERROR_CODES, publicError, validateHintRequest } from "@quattro-kong/game-contracts";

const MAX_BODY_BYTES = 2048;
const GAME_RULES = [
  "Quattro Kong is a 2D rooftop platform game on a 640x900 canvas.",
  "The player climbs four ladders, alternating between the right and left edges of five platforms.",
  "The first ladder is on the right at x=544; the next is on the left at x=64.",
  "A rolling hazard moves on the second platform (y=680). A patrol enemy moves on the fourth platform (y=360).",
  "On easy, threats move at 65% of normal speed and damage protection lasts 1.5 seconds instead of 1 second.",
].join(" ");

export { validateHintRequest };

export async function generateHint(snapshot, { apiKey, model = "gpt-5-mini", fetchImpl = fetch }) {
  const response = await fetchImpl("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      max_output_tokens: 512,
      instructions: `You are a game coach. ${GAME_RULES} Give one short, actionable hint in English about the recorded hit. Do not invent unseen enemy positions, movement directions, or game mechanics. Do not mention coordinates.`,
      input: JSON.stringify(snapshot),
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
  const result = await response.json();
  const hint = result.output
    ?.flatMap((item) => item.content ?? [])
    .filter((part) => part.type === "output_text")
    .map((part) => part.text)
    .join(" ")
    .trim();
  if (!hint) throw new Error("OpenAI returned no hint");
  return hint.slice(0, 300);
}

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

export function createHintServer({ apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL, generate = generateHint } = {}) {
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
    const snapshot = validateHintRequest(raw);
    if (!snapshot) {
      sendJson(response, 400, publicError(API_ERROR_CODES.INVALID_REQUEST, "Invalid game state."));
      return;
    }
    if (!apiKey) {
      sendJson(response, 503, publicError(API_ERROR_CODES.COACH_UNAVAILABLE, "AI coach is not configured."));
      return;
    }

    try {
      const hint = await generate(snapshot, { apiKey, model });
      sendJson(response, 200, { hint });
    } catch (error) {
      console.error("AI hint request failed:", error);
      sendJson(response, 502, publicError(API_ERROR_CODES.COACH_UNAVAILABLE, "AI coach is unavailable right now."));
    }
  });
}

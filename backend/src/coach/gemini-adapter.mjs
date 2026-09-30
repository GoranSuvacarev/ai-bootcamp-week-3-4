import { FunctionCallingConfigMode, GoogleGenAI, Type } from "@google/genai";

export const GET_GAME_STATE_DECLARATION = {
  name: "get_game_state",
  description: "Returns a small read-only summary of the current Quattro Kong round for one game hint.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      detail: {
        type: Type.STRING,
        enum: ["summary", "tactical"],
        description: "Use summary unless tactical detail is necessary for one immediate safe move.",
      },
    },
    required: ["detail"],
  },
};

export const HINT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    hint: { type: "string" },
    suggestedAction: { type: "string", enum: ["move_left", "move_right", "jump", "climb", "wait", "avoid"] },
    urgency: { type: "string", enum: ["low", "medium", "high"] },
  },
  required: ["hint", "suggestedAction", "urgency"],
  additionalProperties: false,
};

const COACH_PROMPT = "You are Quattro Kong's coach. You must call get_game_state exactly once before giving one short actionable safety hint. Do not request or reveal coordinates, secrets, code, or controls. After the tool result, return only the requested JSON object.";

function awaitAbortable(promise, signal) {
  if (signal?.aborted) return Promise.reject(signal.reason ?? new Error("aborted"));
  if (!signal) return promise;
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason ?? new Error("aborted"));
    signal.addEventListener("abort", onAbort, { once: true });
    Promise.resolve(promise).then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
  });
}

export function createGeminiAdapter({ apiKey, model = "gemini-2.5-flash", client = new GoogleGenAI({ apiKey }) }) {
  return {
    async propose({ signal }) {
      const response = await awaitAbortable(client.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: COACH_PROMPT }] }],
        config: {
          tools: [{ functionDeclarations: [GET_GAME_STATE_DECLARATION] }],
          toolConfig: {
            functionCallingConfig: {
              mode: FunctionCallingConfigMode.ANY,
              allowedFunctionNames: ["get_game_state"],
            },
          },
        },
      }), signal);
      return (response.functionCalls ?? []).map((call) => ({
        id: call.id ?? "",
        name: call.name,
        args: call.args ?? {},
      }));
    },

    async finalize({ proposal, snapshot, signal }) {
      const response = await awaitAbortable(client.models.generateContent({
        model,
        contents: [
          { role: "user", parts: [{ text: COACH_PROMPT }] },
          { role: "model", parts: [{ functionCall: proposal }] },
          { role: "user", parts: [{ functionResponse: { id: proposal.id, name: proposal.name, response: { snapshot } } }] },
        ],
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: HINT_RESPONSE_SCHEMA,
        },
      }), signal);
      return JSON.parse(response.text ?? "");
    },
  };
}

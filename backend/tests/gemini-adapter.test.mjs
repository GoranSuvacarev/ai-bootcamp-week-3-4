import { describe, expect, it, vi } from "vitest";
import { createGeminiAdapter, GET_GAME_STATE_DECLARATION, HINT_RESPONSE_SCHEMA } from "../src/coach/gemini-adapter.mjs";

const proposal = { id: "call-1", name: "get_game_state", args: { detail: "summary" } };
const snapshot = {
  detail: "summary",
  difficulty: "normal",
  lives: 2,
  recentThreat: "rolling_hazard",
  nearbyObjects: [{ kind: "rolling_hazard", relation: "nearby" }],
};
const hint = { hint: "Wait, then climb.", suggestedAction: "wait", urgency: "medium" };

describe("Gemini adapter", () => {
  it("declares one read-only tool and completes the two-turn exchange without exposing its key", async () => {
    const generateContent = vi.fn()
      .mockResolvedValueOnce({ functionCalls: [proposal] })
      .mockResolvedValueOnce({ text: JSON.stringify(hint) });
    const client = { models: { generateContent } };
    const adapter = createGeminiAdapter({ apiKey: "server-key", model: "gemini-2.5-flash", client });

    await expect(adapter.propose({})).resolves.toEqual([proposal]);
    await expect(adapter.finalize({ proposal, snapshot })).resolves.toEqual(hint);

    expect(generateContent).toHaveBeenCalledTimes(2);
    const first = generateContent.mock.calls[0][0];
    const second = generateContent.mock.calls[1][0];
    expect(first.config.tools).toEqual([{ functionDeclarations: [GET_GAME_STATE_DECLARATION] }]);
    expect(first.config.toolConfig.functionCallingConfig.allowedFunctionNames).toEqual(["get_game_state"]);
    expect(second.config.responseJsonSchema).toEqual(HINT_RESPONSE_SCHEMA);
    expect(JSON.stringify(generateContent.mock.calls)).not.toContain("server-key");
  });
});

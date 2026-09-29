import { afterEach, describe, expect, it, vi } from "vitest";
import { createHintServer, generateHint, validateHintRequest } from "../server/hint.mjs";

const snapshot = {
  difficulty: "normal",
  lives: 2,
  lastDamage: { cause: "hazard", x: 160, y: 640, time: 4.5 },
};

const servers = [];

async function startServer(options) {
  const server = createHintServer(options);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
});

describe("AI hint API", () => {
  it("accepts a compact snapshot and strips extra client fields", () => {
    expect(validateHintRequest({ ...snapshot, extra: "ignored" })).toEqual(snapshot);
    expect(validateHintRequest({ ...snapshot, lastDamage: { ...snapshot.lastDamage, cause: "fall" } })).toBeNull();
    expect(validateHintRequest({ ...snapshot, lastDamage: { ...snapshot.lastDamage, x: "160" } })).toBeNull();
  });

  it("returns one generated hint for a valid request", async () => {
    const generate = vi.fn().mockResolvedValue("Wait for the hazard to pass before crossing.");
    const base = await startServer({ apiKey: "test-key", generate });
    const response = await fetch(`${base}/api/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ hint: "Wait for the hazard to pass before crossing." });
    expect(generate).toHaveBeenCalledExactlyOnceWith(snapshot, { apiKey: "test-key", model: undefined });
  });

  it("rejects invalid game data without calling the model", async () => {
    const generate = vi.fn();
    const base = await startServer({ apiKey: "test-key", generate });
    const response = await fetch(`${base}/api/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...snapshot, difficulty: "hard" }),
    });

    expect(response.status).toBe(400);
    expect(generate).not.toHaveBeenCalled();
  });

  it("reports a missing server-side key without calling the model", async () => {
    const generate = vi.fn();
    const base = await startServer({ apiKey: "", generate });
    const response = await fetch(`${base}/api/hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "AI coach is not configured." });
    expect(generate).not.toHaveBeenCalled();
  });

  it("sends the model request with the key only in the server header", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ output: [{ content: [{ type: "output_text", text: "Use the ladder after the hazard passes." }] }] }),
    });

    const hint = await generateHint(snapshot, { apiKey: "test-key", fetchImpl });
    const [url, options] = fetchImpl.mock.calls[0];

    expect(hint).toBe("Use the ladder after the hazard passes.");
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(options.headers.Authorization).toBe("Bearer test-key");
    expect(options.body).not.toContain("test-key");
    expect(JSON.parse(options.body).input).toBe(JSON.stringify(snapshot));
  });
});

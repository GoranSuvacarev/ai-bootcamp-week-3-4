import { afterEach, describe, expect, it, vi } from "vitest";
import { createHintServer } from "../src/hint.mjs";

const context = {
  difficulty: "normal",
  lives: 2,
  lastDamage: { cause: "hazard", x: 160, y: 640, time: 4.5 },
};
const proposal = { id: "call-1", name: "get_game_state", args: { detail: "summary" } };
const hint = {
  hint: "Wait for the rolling hazard to pass, then climb the right ladder.",
  suggestedAction: "wait",
  urgency: "medium",
};

const servers = [];
async function startServer(options) {
  const server = createHintServer(options);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  servers.push(server);
  return "http://127.0.0.1:" + server.address().port;
}
afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
});

describe("AI hint API", () => {
  it("returns a validated structured hint through the controlled flow", async () => {
    const coach = { propose: vi.fn().mockResolvedValue([proposal]), finalize: vi.fn().mockResolvedValue(hint) };
    const events = [];
    const base = await startServer({ apiKey: "test-key", coach, eventSink: (event) => events.push(event) });
    const response = await fetch(base + "/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(hint);
    expect(coach.propose).toHaveBeenCalledOnce();
    expect(events[0]).toMatchObject({ operation: "ai_hint", status: "success" });
    expect(JSON.stringify(events[0])).not.toContain("test-key");
  });

  it("rejects invalid browser data before the model or tool is called", async () => {
    const coach = { propose: vi.fn(), finalize: vi.fn() };
    const base = await startServer({ apiKey: "test-key", coach });
    const response = await fetch(base + "/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...context, difficulty: "hard" }),
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: { code: "INVALID_REQUEST", message: "Invalid game state." } });
    expect(coach.propose).not.toHaveBeenCalled();
  });

  it("reports missing Gemini configuration without calling the provider", async () => {
    const coach = { propose: vi.fn(), finalize: vi.fn() };
    const base = await startServer({ apiKey: "", coach });
    const response = await fetch(base + "/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: { code: "COACH_UNAVAILABLE", message: "AI coach is not configured." } });
    expect(coach.propose).not.toHaveBeenCalled();
  });

  it("retains only redacted telemetry for completed requests by default", async () => {
    const coach = { propose: vi.fn().mockResolvedValue([proposal]), finalize: vi.fn().mockResolvedValue(hint) };
    const server = createHintServer({ apiKey: "test-key", coach });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    servers.push(server);
    const response = await fetch("http://127.0.0.1:" + server.address().port + "/api/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    });

    expect(response.status).toBe(200);
    expect(server.getCoachEvents()).toHaveLength(1);
    expect(server.getCoachEvents()[0]).toMatchObject({ operation: "ai_hint", status: "success", attempts: 2 });
    expect(Object.keys(server.getCoachEvents()[0]).sort()).toEqual(["attempts", "latencyMs", "operation", "requestId", "status"]);
  });
});

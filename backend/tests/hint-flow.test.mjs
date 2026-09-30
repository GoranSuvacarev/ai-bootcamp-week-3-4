import { describe, expect, it, vi } from "vitest";
import { createGameStateTool } from "../src/coach/game-state-tool.mjs";
import { createHintFlow } from "../src/coach/hint-flow.mjs";

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

const transient = () => Object.assign(new Error("temporary"), { status: 503 });

describe("controlled AI hint flow", () => {
  it("executes one valid tool call then returns one validated hint and safe event", async () => {
    const model = {
      propose: vi.fn().mockResolvedValue([proposal]),
      finalize: vi.fn().mockResolvedValue(hint),
    };
    const tool = createGameStateTool();
    const events = [];
    const result = await createHintFlow({ model, tool, eventSink: (event) => events.push(event) }).run(context);

    expect(result).toEqual({ status: 200, body: hint });
    expect(model.propose).toHaveBeenCalledOnce();
    expect(model.finalize).toHaveBeenCalledOnce();
    expect(model.finalize.mock.calls[0][0].snapshot).toEqual({
      detail: "summary",
      difficulty: "normal",
      lives: 2,
      recentThreat: "rolling_hazard",
      nearbyObjects: [{ kind: "rolling_hazard", relation: "nearby" }, { kind: "ladder", relation: "next_route" }],
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ operation: "ai_hint", status: "success", attempts: 2 });
    expect(Object.keys(events[0]).sort()).toEqual(["attempts", "latencyMs", "operation", "requestId", "status"]);
  });

  it.each([
    [{ ...proposal, name: "execute_anything" }],
    [{ ...proposal, args: {} }],
    [{ ...proposal, args: { detail: "summary", extra: true } }],
    [],
    [proposal, proposal],
  ])("rejects invalid tool proposals without tool or final calls", async (proposals) => {
    const model = { propose: vi.fn().mockResolvedValue(proposals), finalize: vi.fn() };
    const tool = { getGameState: vi.fn() };
    const result = await createHintFlow({ model, tool }).run(context);

    expect(result.status).toBe(502);
    expect(result.body.error.code).toBe("INVALID_TOOL");
    expect(tool.getGameState).not.toHaveBeenCalled();
    expect(model.finalize).not.toHaveBeenCalled();
  });

  it("rejects a direct model answer without executing the tool", async () => {
    const model = { propose: vi.fn().mockResolvedValue({ text: "Just jump." }), finalize: vi.fn() };
    const tool = { getGameState: vi.fn() };
    const result = await createHintFlow({ model, tool }).run(context);

    expect(result.body.error.code).toBe("INVALID_TOOL");
    expect(tool.getGameState).not.toHaveBeenCalled();
  });

  it("does not continue when the deterministic tool output is malformed", async () => {
    const model = { propose: vi.fn().mockResolvedValue([proposal]), finalize: vi.fn() };
    const tool = { getGameState: vi.fn().mockReturnValue({ private: "no" }) };
    const result = await createHintFlow({ model, tool }).run(context);

    expect(result.body.error.code).toBe("MALFORMED_OUTPUT");
    expect(model.finalize).not.toHaveBeenCalled();
  });

  it("retries a transient final provider failure with the same one tool result", async () => {
    const model = {
      propose: vi.fn().mockResolvedValue([proposal]),
      finalize: vi.fn().mockRejectedValueOnce(transient()).mockResolvedValue(hint),
    };
    const tool = createGameStateTool();
    const getGameState = vi.spyOn(tool, "getGameState");
    const result = await createHintFlow({ model, tool }).run(context);

    expect(result).toEqual({ status: 200, body: hint });
    expect(model.finalize).toHaveBeenCalledTimes(2);
    expect(getGameState).toHaveBeenCalledOnce();
  });

  it("retries a transient proposal failure before the one tool execution", async () => {
    const model = {
      propose: vi.fn().mockRejectedValueOnce(transient()).mockResolvedValue([proposal]),
      finalize: vi.fn().mockResolvedValue(hint),
    };
    const tool = createGameStateTool();
    const getGameState = vi.spyOn(tool, "getGameState");
    const result = await createHintFlow({ model, tool }).run(context);

    expect(result).toEqual({ status: 200, body: hint });
    expect(model.propose).toHaveBeenCalledTimes(2);
    expect(getGameState).toHaveBeenCalledOnce();
  });

  it("does not retry non-transient or malformed final work", async () => {
    const model = { propose: vi.fn().mockRejectedValue(Object.assign(new Error("denied"), { status: 401 })), finalize: vi.fn() };
    const result = await createHintFlow({ model, tool: createGameStateTool() }).run(context);
    expect(result.body.error.code).toBe("COACH_UNAVAILABLE");
    expect(model.propose).toHaveBeenCalledOnce();

    const malformedModel = { propose: vi.fn().mockResolvedValue([proposal]), finalize: vi.fn().mockResolvedValue({ ...hint, urgency: "now" }) };
    const malformed = await createHintFlow({ model: malformedModel, tool: createGameStateTool() }).run(context);
    expect(malformed.body.error.code).toBe("MALFORMED_OUTPUT");
    expect(malformedModel.finalize).toHaveBeenCalledOnce();
  });

  it("returns safe cancellation and deadline outcomes without starting a retry", async () => {
    const controller = new AbortController();
    const pendingModel = { propose: vi.fn().mockImplementation(() => new Promise(() => {})), finalize: vi.fn() };
    const pending = createHintFlow({ model: pendingModel, tool: createGameStateTool() }).run(context, { signal: controller.signal });
    controller.abort();
    const cancelled = await pending;
    expect(cancelled.status).toBe(499);
    expect(cancelled.body.error.code).toBe("CANCELLED");
    expect(pendingModel.propose).toHaveBeenCalledOnce();

    const timeoutModel = { propose: vi.fn().mockImplementation(() => new Promise(() => {})), finalize: vi.fn() };
    const timedOut = await createHintFlow({ model: timeoutModel, tool: createGameStateTool(), deadlineMs: 1 }).run(context);
    expect(timedOut.status).toBe(503);
    expect(timedOut.body.error.code).toBe("COACH_UNAVAILABLE");
    expect(timeoutModel.propose).toHaveBeenCalledOnce();
  });
});

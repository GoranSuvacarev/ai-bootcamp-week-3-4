export function createGameStateTool() {
  return {
    getGameState(context, args) {
      const recentThreat = context.lastDamage.cause === "hazard" ? "rolling_hazard" : "patrol_enemy";
      const nearbyObjects = recentThreat === "rolling_hazard"
        ? [{ kind: "rolling_hazard", relation: "nearby" }, { kind: "ladder", relation: "next_route" }]
        : [{ kind: "patrol_enemy", relation: "nearby" }, { kind: "ladder", relation: "next_route" }];

      return {
        detail: args.detail,
        difficulty: context.difficulty,
        lives: context.lives,
        recentThreat,
        nearbyObjects,
      };
    },
  };
}

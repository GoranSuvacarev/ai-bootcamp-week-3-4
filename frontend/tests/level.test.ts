import { describe, expect, it } from "vitest";
import { CORE_LADDERS, CORE_PLATFORMS } from "../src/game/level";

describe("core level layout", () => {
  it("uses full-width platforms for the vertical route", () => {
    expect(CORE_PLATFORMS.map(({ x, width }) => ({ x, width }))).toEqual(
      Array.from({ length: 5 }, () => ({ x: 32, width: 576 })),
    );
  });

  it("alternates ladders between the right and left edges", () => {
    expect(CORE_LADDERS.map(({ x }) => x)).toEqual([544, 64, 544, 64]);
    expect(CORE_LADDERS.map(({ y }) => y)).toEqual([680, 520, 360, 200]);
  });
});

import { describe, expect, it } from "vitest";
import { crossings, safeStops } from "./CaffeineCurve";

const at = (h: number, mg: number) => ({ t: new Date(Date.UTC(2026, 9, 25, h)).toISOString(), mg });

describe("safeStops", () => {
  it("switches from red to green where the curve crosses the safe line", () => {
    // 200 mg at 0 h falling to 0 at 4 h: crosses 50 mg at 3 h, 3/4 of the way along.
    expect(safeStops([at(0, 200), at(4, 0)], 50)).toEqual([
      { offset: 0, above: true }, { offset: 0.75, above: true },
      { offset: 0.75, above: false }, { offset: 1, above: false },
    ]);
  });

  it("is all green when it never goes over, and red back again for a new drink", () => {
    expect(safeStops([at(0, 10), at(2, 5)], 50)).toEqual([{ offset: 0, above: false }, { offset: 1, above: false }]);
    const stops = safeStops([at(0, 10), at(1, 110), at(2, 10)], 60);
    expect(stops.map((s) => s.above)).toEqual([false, false, true, true, false, false]);
    expect(stops[1].offset).toBeCloseTo(0.25);
    expect(stops[3].offset).toBeCloseTo(0.75);
  });
});

describe("crossings", () => {
  it("finds each crossing and its direction", () => {
    const c = crossings([at(0, 10), at(1, 110), at(2, 10)], 60);
    expect(c.map((x) => x.down)).toEqual([false, true]);
    expect(new Date(c[1].t).toISOString()).toBe("2026-10-25T01:30:00.000Z");
  });
});

import { describe, expect, it } from "vitest";
import { cutoffForDrink } from "./fixtures";

describe("cutoffForDrink", () => {
  it("keeps the coffee cutoff for a 130 mg drink", () => {
    expect(cutoffForDrink("14:10", 5, 130, "23:30")).toBe("14:10");
  });
  it("moves earlier for stronger drinks and later for weaker ones", () => {
    expect(cutoffForDrink("14:10", 5, 260, "23:30")).toBe("09:10");   // twice as strong: one half-life earlier
    expect(cutoffForDrink("14:10", 5, 65, "23:30")).toBe("19:10");
  });
  it("is never later than bedtime and null before midnight", () => {
    expect(cutoffForDrink("14:10", 5, 10, "23:30")).toBe("23:30");
    expect(cutoffForDrink("08:00", 9, 400, "23:30")).toBeNull();
    expect(cutoffForDrink(null, 5, 45, "23:30")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { usualDrinks } from "./UsualSuggestions";
import type { Drink } from "@/lib/types";

const at = (day: number, h: number, key: string, mg = 100): Drink => ({
  time: new Date(2026, 9, day, h, 0).toISOString(), user_id: 1, drink_key: key, mg, mg_low: mg, mg_high: mg, source: "preset",
});

describe("usualDrinks", () => {
  it("returns nothing for no history", () => {
    expect(usualDrinks([], new Date(2026, 9, 24, 9))).toEqual([]);
  });

  it("ranks by frequency", () => {
    const drinks = [at(1, 9, "a"), at(2, 9, "a"), at(3, 9, "a"), at(1, 9, "b"), at(2, 9, "b"), at(1, 9, "c")];
    expect(usualDrinks(drinks, new Date(2026, 9, 24, 9)).map((d) => d.drink_key)).toEqual(["a", "b", "c"]);
  });

  it("weights drinks near the current hour", () => {
    // tea twice in the afternoon beats coffee three times in the morning, when it is 15:00
    const drinks = [at(1, 8, "coffee"), at(2, 8, "coffee"), at(3, 8, "coffee"), at(1, 15, "tea"), at(2, 16, "tea")];
    expect(usualDrinks(drinks, new Date(2026, 9, 24, 15))[0].drink_key).toBe("tea");
    expect(usualDrinks(drinks, new Date(2026, 9, 24, 8))[0].drink_key).toBe("coffee");
  });

  it("wraps around midnight", () => {
    const drinks = [at(1, 23, "late"), at(1, 12, "noon"), at(2, 12, "noon")];
    expect(usualDrinks(drinks, new Date(2026, 9, 24, 1))[0].drink_key).toBe("late");
  });

  it("caps at n and returns the most recent instance", () => {
    const drinks = ["a", "b", "c", "d"].flatMap((k) => [at(1, 9, k), at(5, 9, k)]);
    const top = usualDrinks(drinks, new Date(2026, 9, 24, 9), 3);
    expect(top).toHaveLength(3);
    expect(new Date(top[0].time).getDate()).toBe(5);
  });

  it("treats different sizes of the same drink as separate", () => {
    const drinks = [at(1, 9, "latte", 65), at(2, 9, "latte", 130), at(3, 9, "latte", 130)];
    expect(usualDrinks(drinks, new Date(2026, 9, 24, 9)).map((d) => d.mg)).toEqual([130, 65]);
  });
});

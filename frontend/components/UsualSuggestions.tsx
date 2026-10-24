"use client";

import type { Drink } from "@/lib/types";

interface Props {
  drinks: Drink[];
  onPick: (drink: Drink) => void;
}

const NEAR_HOURS = 2;
const NEAR_WEIGHT = 3;

/** Circular distance between two hours of the day (0..12). */
const hourGap = (a: number, b: number) => Math.min(Math.abs(a - b), 24 - Math.abs(a - b));

/**
 * Top `n` drinks by frequency, where drinks taken within ±2 h of `now`'s hour count
 * NEAR_WEIGHT times. Distinct by drink_key + mg; returns the most recent instance of each.
 */
export function usualDrinks(drinks: Drink[], now: Date, n = 3): Drink[] {
  const hour = now.getHours() + now.getMinutes() / 60;
  const groups = new Map<string, { score: number; latest: Drink }>();
  for (const d of drinks) {
    const t = new Date(d.time);
    const key = `${d.drink_key}:${Math.round(d.mg)}`;
    const w = hourGap(t.getHours() + t.getMinutes() / 60, hour) <= NEAR_HOURS ? NEAR_WEIGHT : 1;
    const g = groups.get(key);
    if (!g) groups.set(key, { score: w, latest: d });
    else {
      g.score += w;
      if (t > new Date(g.latest.time)) g.latest = d;
    }
  }
  return [...groups.values()]
    .sort((a, b) => b.score - a.score || new Date(b.latest.time).getTime() - new Date(a.latest.time).getTime())
    .slice(0, n)
    .map((g) => g.latest);
}

const label = (key: string) => key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export default function UsualSuggestions({ drinks, onPick }: Props) {
  const top = usualDrinks(drinks, new Date());
  if (top.length === 0) return null;
  return (
    <div>
      <p className="eyebrow">Your usual?</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {top.map((d) => (
          <button key={`${d.drink_key}:${d.mg}`} className="pill" onClick={() => onPick(d)}>
            {label(d.drink_key)}
            <span style={{ marginLeft: 6, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{Math.round(d.mg)} mg</span>
          </button>
        ))}
      </div>
    </div>
  );
}

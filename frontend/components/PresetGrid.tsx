"use client";

import { useState } from "react";
import type { Preset } from "@/lib/types";

interface Props {
  presets: Preset[];
  onPick: (preset: Preset) => void;
}

type Kind = "coffee" | "tea" | "energy" | "other";

const KINDS: [Kind | "all", string][] = [
  ["all", "All"], ["coffee", "Coffee"], ["tea", "Tea"], ["energy", "Energy & soda"], ["other", "Other"],
];

const KIND_OF: Record<string, Kind> = {
  espresso_shot: "coffee", milk_coffee: "coffee", americano: "coffee", mocha: "coffee", filter_coffee: "coffee",
  cold_brew: "coffee", instant_coffee: "coffee", capsule_coffee: "coffee", decaf: "coffee",
  black_tea: "tea", green_tea: "tea", oolong_tea: "tea", white_tea: "tea", matcha: "tea", chai_latte: "tea",
  milk_tea: "tea", yerba_mate: "tea", iced_tea_bottled: "tea", herbal_tea: "tea",
  cola: "energy", diet_cola: "energy", red_bull: "energy", energy_drink_500: "energy", pre_workout: "energy",
};
const kindOf = (key: string): Kind => KIND_OF[key] ?? "other";

export default function PresetGrid({ presets, onPick }: Props) {
  const [kind, setKind] = useState<Kind | "all">("all");
  const present = new Set(presets.map((p) => kindOf(p.key)));
  const shown = kind === "all" ? presets : presets.filter((p) => kindOf(p.key) === kind);

  return (
    <div>
      <div role="group" aria-label="Filter by type" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {KINDS.filter(([k]) => k === "all" || present.has(k)).map(([k, text]) => (
          <button key={k} className="pill" aria-pressed={kind === k} onClick={() => setKind(k)}>{text}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", columnGap: 32, borderTop: "1px solid var(--border)" }}>
        {shown.map((p) => (
          <button key={p.key} className="tile" onClick={() => onPick(p)} aria-label={`${p.label}, ${Math.round(p.mg)} mg`}>
            <span>{p.label}</span>
            <span className="num" style={{ fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap" }}>{Math.round(p.mg)} mg</span>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import type { Preset } from "@/lib/types";

interface Props {
  presets: Preset[];
  onPick: (preset: Preset) => void;
}

export default function PresetGrid({ presets, onPick }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 8 }}>
      {presets.map((p) => (
        <button key={p.key} className="tile" onClick={() => onPick(p)} aria-label={`${p.label}, ${Math.round(p.mg)} mg`}>
          <span aria-hidden style={{ fontSize: "1.25rem", lineHeight: 1 }}>{p.emoji}</span>
          <span style={{ fontSize: "0.85rem", lineHeight: 1.25 }}>{p.label}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{Math.round(p.mg)} mg</span>
        </button>
      ))}
    </div>
  );
}

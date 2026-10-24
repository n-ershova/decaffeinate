"use client";

import type { Preset } from "@/lib/types";

interface Props {
  presets: Preset[];
  onPick: (preset: Preset) => void;
}

export default function PresetGrid({ presets, onPick }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", columnGap: 32, borderTop: "1px solid var(--border)" }}>
      {presets.map((p) => (
        <button key={p.key} className="tile" onClick={() => onPick(p)} aria-label={`${p.label}, ${Math.round(p.mg)} mg`}>
          <span>{p.label}</span>
          <span className="num" style={{ fontSize: "0.8rem", color: "var(--muted)", whiteSpace: "nowrap" }}>{Math.round(p.mg)} mg</span>
        </button>
      ))}
    </div>
  );
}

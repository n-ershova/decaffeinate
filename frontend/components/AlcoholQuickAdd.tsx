"use client";

interface Props {
  onAdd: (units: number) => void;
}

const OPTIONS = [
  { label: "Pint", units: 2.3 },
  { label: "Glass of wine", units: 2.1 },
  { label: "Spirit", units: 1 },
];

export default function AlcoholQuickAdd({ onAdd }: Props) {
  return (
    <div>
      <p style={{ margin: "0 0 10px", fontSize: "0.8rem", color: "var(--muted)" }}>Alcohol</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {OPTIONS.map((o) => (
          <button key={o.label} className="pill" onClick={() => onAdd(o.units)}>
            {o.label}
            <span style={{ marginLeft: 6, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{o.units}u</span>
          </button>
        ))}
      </div>
    </div>
  );
}

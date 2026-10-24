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
      <p className="eyebrow">Alcohol, for tonight&apos;s sleep</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {OPTIONS.map((o) => (
          <button key={o.label} className="pill" onClick={() => onAdd(o.units)}>
            {o.label}
            <span className="num" style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--muted)" }}>{o.units} u</span>
          </button>
        ))}
      </div>
    </div>
  );
}

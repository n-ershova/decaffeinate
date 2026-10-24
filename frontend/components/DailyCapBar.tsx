interface Props {
  totalMg: number;
  capMg: number;
}

export default function DailyCapBar({ totalMg, capMg }: Props) {
  const pct = Math.min(100, (totalMg / capMg) * 100);
  const atCap = totalMg >= capMg;
  const color = atCap ? "var(--red)" : "var(--text)";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "0.85rem", color: "var(--muted)", marginBottom: 8 }}>
        <span>Today</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          <span style={{ color: atCap ? "var(--red)" : "var(--text)", fontWeight: 600 }}>{Math.round(totalMg)}</span> / {capMg} mg
        </span>
      </div>
      <div
        role="progressbar" aria-valuemin={0} aria-valuemax={capMg} aria-valuenow={Math.min(totalMg, capMg)}
        aria-label="Daily caffeine"
        style={{ height: 4, borderRadius: 2, background: "var(--surface-2)", overflow: "hidden" }}
      >
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.3s ease" }} />
      </div>
      {atCap && <p style={{ margin: "8px 0 0", fontSize: "0.8rem", color: "var(--red)" }}>Daily limit reached</p>}
    </div>
  );
}

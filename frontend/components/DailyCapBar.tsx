interface Props {
  totalMg: number;
  capMg: number;
}

export default function DailyCapBar({ totalMg, capMg }: Props) {
  const atCap = totalMg >= capMg;
  const color = atCap ? "var(--red)" : "var(--muted)";
  return (
    <div>
      <div
        role="progressbar" aria-label="Daily caffeine" aria-valuemin={0} aria-valuemax={capMg} aria-valuenow={Math.min(totalMg, capMg)}
        style={{ height: 2, background: "var(--border)" }}
      >
        <div style={{ width: `${Math.min(100, (totalMg / capMg) * 100)}%`, height: "100%", background: atCap ? "var(--red)" : "var(--text)", transition: "width 0.3s ease" }} />
      </div>
      <p style={{ margin: "8px 0 0", fontSize: "0.8rem", color, fontVariantNumeric: "tabular-nums" }}>
        {atCap ? `Daily limit reached · ${Math.round(totalMg)} mg` : `${Math.round(totalMg)} of ${capMg} mg today`}
      </p>
    </div>
  );
}

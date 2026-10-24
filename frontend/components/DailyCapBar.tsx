interface Props {
  totalMg: number;
  capMg: number;
}

export default function DailyCapBar({ totalMg, capMg }: Props) {
  const atCap = totalMg >= capMg;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "0.8rem", color: "var(--muted)", marginBottom: 10 }}>
        <span style={{ color: atCap ? "var(--red)" : undefined }}>{atCap ? "Daily limit reached" : "Today so far"}</span>
        <span className="num">
          <span style={{ color: atCap ? "var(--red)" : "var(--text)" }}>{Math.round(totalMg)}</span> / {capMg} mg
        </span>
      </div>
      <div
        role="progressbar" aria-label="Daily caffeine" aria-valuemin={0} aria-valuemax={capMg} aria-valuenow={Math.min(totalMg, capMg)}
        style={{ height: 1, background: "var(--border)" }}
      >
        <div style={{ width: `${Math.min(100, (totalMg / capMg) * 100)}%`, height: 1, background: atCap ? "var(--red)" : "var(--text)", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

import type { SleepNight } from "@/lib/types";

interface Props {
  checkins: SleepNight[];
}

const fmtNight = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

export default function CheckinHistory({ checkins }: Props) {
  const rows = [...checkins].sort((a, b) => b.night.localeCompare(a.night));
  if (rows.length === 0) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No check-ins yet.</p>;

  return (
    <section>
      <p className="eyebrow">Check-ins</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map((c) => (
          <li key={c.night} style={{
            display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, alignItems: "baseline",
            padding: "12px 0", borderBottom: "1px solid var(--border)", fontSize: "0.9rem", fontVariantNumeric: "tabular-nums",
          }}>
            <span>{fmtNight(c.night)}<span style={{ color: "var(--muted)", marginLeft: 8 }}>{fmtTime(c.bedtime)}</span></span>
            <span style={{ color: "var(--muted)" }}>{Math.round(c.latency_min)} min</span>
            <span aria-label={c.rested_1to5 ? `Rested ${c.rested_1to5} of 5` : "Rested not given"} style={{ display: "flex", gap: 3, width: 46 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} style={{ width: 6, height: 6, borderRadius: "50%", background: c.rested_1to5 && n <= c.rested_1to5 ? "var(--text)" : "var(--border)" }} />
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

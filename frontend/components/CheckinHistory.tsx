import SelectBox from "@/components/SelectBox";
import type { SleepNight } from "@/lib/types";

interface Props {
  checkins: SleepNight[];
  /** When set, rows become checkboxes keyed by `night`. */
  selected?: Set<string>;
  onToggle?: (night: string) => void;
}

const fmtNight = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

export default function CheckinHistory({ checkins, selected, onToggle }: Props) {
  const rows = [...checkins].sort((a, b) => b.night.localeCompare(a.night));
  if (rows.length === 0) return <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No check-ins yet.</p>;

  return (
    <section>
      <p style={{ margin: 0, fontSize: "0.95rem" }}>Sleep</p>
      <p className="caption" style={{ marginBottom: 12 }}>When you went to bed, how long it took to fall asleep, and how rested you felt.</p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map((c) => (
          <li key={c.night} onClick={selected && (() => onToggle?.(c.night))} style={{
            display: "grid", gridTemplateColumns: selected ? "auto 1fr auto auto" : "1fr auto auto", gap: 16, alignItems: "baseline",
            padding: "13px 0", borderBottom: "1px solid var(--border)", fontSize: "0.9rem", cursor: selected ? "pointer" : undefined,
          }}>
            {selected && <SelectBox checked={selected.has(c.night)} label={fmtNight(c.night)} />}
            <span>{fmtNight(c.night)}<span className="num" style={{ color: "var(--muted)", marginLeft: 10, fontSize: "0.75rem" }}>bed {fmtTime(c.bedtime)}</span></span>
            <span className="num" style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{Math.round(c.latency_min)} min</span>
            <span aria-label={c.rested_1to5 ? `Rested ${c.rested_1to5} of 5` : "Rested not given"} className="hint"
              data-hint={c.rested_1to5 ? `Rested ${c.rested_1to5}/5` : "Rested: not given"} style={{ display: "flex", gap: 3, width: 46, padding: "8px 0", margin: "-8px 0", cursor: "default" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} style={{ width: 5, height: 5, borderRadius: "50%", background: c.rested_1to5 && n <= c.rested_1to5 ? "var(--text)" : "var(--border)" }} />
              ))}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

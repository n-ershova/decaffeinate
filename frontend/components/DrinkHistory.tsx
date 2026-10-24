import SelectBox from "@/components/SelectBox";
import type { Drink } from "@/lib/types";

interface Props {
  drinks: Drink[];
  /** When set, rows become checkboxes keyed by drink `time`. */
  selected?: Set<string>;
  onToggle?: (time: string) => void;
}

const label = (key: string) => key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const fmtDay = (d: Date) => d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

export default function DrinkHistory({ drinks, selected, onToggle }: Props) {
  const rows = [...drinks].sort((a, b) => b.time.localeCompare(a.time));

  // Newest day first, drinks within a day newest first.
  const days: { day: string; drinks: Drink[]; total: number }[] = [];
  for (const d of rows) {
    const day = fmtDay(new Date(d.time));
    const last = days[days.length - 1];
    if (last?.day === day) { last.drinks.push(d); last.total += d.mg; }
    else days.push({ day, drinks: [d], total: d.mg });
  }

  return (
    <section>
      <p style={{ margin: 0, fontSize: "0.95rem" }}>Intake</p>
      <p className="caption" style={{ marginBottom: 12 }}>Everything you&apos;ve logged in the last two weeks.</p>
      {days.length === 0 && <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No drinks yet.</p>}
      {days.map((g) => (
        <div key={g.day} style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{g.day}</span>
            <span className="num" style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{Math.round(g.total)} mg</span>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {g.drinks.map((d) => (
              <li key={d.time + d.drink_key} onClick={selected && (() => onToggle?.(d.time))} style={{
                display: "grid", gridTemplateColumns: selected ? "auto auto 1fr auto" : "auto 1fr auto", gap: 16, alignItems: "baseline",
                padding: "13px 0", borderBottom: "1px solid var(--border)", fontSize: "0.9rem", cursor: selected ? "pointer" : undefined,
              }}>
                {selected && <SelectBox checked={selected.has(d.time)} label={`${label(d.drink_key)} at ${fmtTime(new Date(d.time))}`} />}
                <span className="num" style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{fmtTime(new Date(d.time))}</span>
                <span>{label(d.drink_key)}</span>
                <span className="num" style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{Math.round(d.mg)} mg</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

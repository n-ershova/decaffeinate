import DailyCapBar from "@/components/DailyCapBar";
import TodayHeadline from "@/components/TodayHeadline";
import type { Led } from "@/lib/types";

const CASES: { name: string; headline: string; cutoff: string | null; led: Led; total: number }[] = [
  { name: "Green", headline: "Last coffee today by 17:30", cutoff: "17:30", led: "green", total: 90 },
  { name: "Amber", headline: "Last coffee today by 14:10", cutoff: "14:10", led: "amber", total: 280 },
  { name: "Red, no cutoff", headline: "No more caffeine today", cutoff: null, led: "red", total: 340 },
  { name: "Red, at cap", headline: "No more caffeine today", cutoff: null, led: "red", total: 420 },
];

export default function Preview() {
  return (
    <>
      <h1>TodayHeadline + DailyCapBar</h1>
      {CASES.map((c) => (
        <section key={c.name} style={{ marginTop: 48, maxWidth: 520 }}>
          <p style={{ margin: "0 0 12px", fontSize: "0.75rem", color: "var(--muted)" }}>{c.name}</p>
          <TodayHeadline headline={c.headline} cutoff={c.cutoff} led={c.led} />
          <div style={{ marginTop: 24 }}><DailyCapBar totalMg={c.total} capMg={400} /></div>
        </section>
      ))}
    </>
  );
}

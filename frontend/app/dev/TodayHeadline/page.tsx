import DailyCapBar from "@/components/DailyCapBar";
import TodayHeadline from "@/components/TodayHeadline";

const label = { color: "var(--muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "40px 0 12px" };

export default function Preview() {
  return (
    <>
      <h1>TodayHeadline + DailyCapBar</h1>
      <h3 style={label}>Green</h3>
      <TodayHeadline headline="Last coffee today by 17:30" cutoff="17:30" led="green" />
      <div style={{ marginTop: 20 }}><DailyCapBar totalMg={90} capMg={400} /></div>
      <h3 style={label}>Amber</h3>
      <TodayHeadline headline="Last coffee today by 14:10" cutoff="14:10" led="amber" />
      <div style={{ marginTop: 20 }}><DailyCapBar totalMg={280} capMg={400} /></div>
      <h3 style={label}>Red · no cutoff</h3>
      <TodayHeadline headline="No more caffeine today" cutoff={null} led="red" />
      <div style={{ marginTop: 20 }}><DailyCapBar totalMg={340} capMg={400} /></div>
      <h3 style={label}>Red · at cap</h3>
      <TodayHeadline headline="No more caffeine today" cutoff={null} led="red" />
      <div style={{ marginTop: 20 }}><DailyCapBar totalMg={420} capMg={400} /></div>
    </>
  );
}

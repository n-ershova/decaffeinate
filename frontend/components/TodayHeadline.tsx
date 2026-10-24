import type { Led } from "@/lib/types";

interface Props {
  headline: string;
  cutoff: string | null; // "HH:MM"
  led: Led;
}

const STATUS: Record<Led, string> = {
  green: "Clear",
  amber: "Careful",
  red: "Stop",
};

export default function TodayHeadline({ headline, cutoff, led }: Props) {
  const color = `var(--${led})`;
  return (
    <header>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>
        <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
        {STATUS[led]}
      </div>
      <h2 style={{ margin: "10px 0 0", fontSize: "clamp(1.9rem, 6vw, 2.75rem)", lineHeight: 1.1, fontWeight: 600, letterSpacing: "-0.03em", color }}>
        {headline}
      </h2>
      {cutoff && (
        <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
          Cutoff <span style={{ color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{cutoff}</span>
        </p>
      )}
    </header>
  );
}

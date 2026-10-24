import type { ProfileResponse } from "@/lib/types";

interface Props {
  profile: ProfileResponse;
}

const SCALE_MAX = 12;
const pct = (h: number) => `${(Math.min(Math.max(h, 0), SCALE_MAX) / SCALE_MAX) * 100}%`;

export default function HalfLifeCard({ profile }: Props) {
  const { half_life: h, population_mean_h: pop, sensitivity } = profile;
  const diff = h.mean - pop;
  const compare =
    Math.abs(diff) < 0.5
      ? "About the same as most people."
      : diff > 0
        ? `Slower than most people, so a coffee stays with you about ${diff.toFixed(1)} hours longer.`
        : `Faster than most people, so a coffee leaves you about ${(-diff).toFixed(1)} hours sooner.`;

  return (
    <section>
      <p className="eyebrow">How fast your body clears caffeine</p>
      <p style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>
        <span style={{ fontSize: "clamp(5rem, 20vw, 7.5rem)", fontWeight: 200, letterSpacing: "-0.055em", lineHeight: 0.92, fontFeatureSettings: '"tnum"' }}>{h.mean.toFixed(1)}</span>
        <span style={{ fontSize: "1.25rem", fontWeight: 300, color: "var(--muted)", marginLeft: 6 }}>hours</span>
        <span className="num" style={{ fontSize: "0.8rem", color: "var(--muted)", marginLeft: 12 }}>± {h.sd.toFixed(1)}</span>
      </p>
      <p style={{ margin: "16px 0 0", fontSize: "0.95rem", maxWidth: "46ch" }}>
        Every {h.mean.toFixed(1)} hours, half the caffeine in your body is gone. {compare}
      </p>
      <p className="caption">
        Scientists call this your caffeine <strong>half-life</strong>. It differs a lot between people, from about 2 to 10 hours.
      </p>

      {/* 0–12 h scale: your 80% interval as a band, population average as a tick */}
      <div style={{ position: "relative", height: 36, marginTop: 28 }} aria-hidden>
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 1, background: "var(--border)" }} />
        <div style={{ position: "absolute", top: 11, height: 3, background: "var(--text)", opacity: 0.3,
          left: pct(h.ci80[0]), width: `calc(${pct(h.ci80[1])} - ${pct(h.ci80[0])})` }} />
        <div style={{ position: "absolute", top: 8, width: 9, height: 9, marginLeft: -4.5, borderRadius: "50%", background: "var(--text)", left: pct(h.mean) }} />
        <div style={{ position: "absolute", top: 4, width: 1, height: 18, background: "var(--muted)", left: pct(pop) }} />
        <span style={{ position: "absolute", top: 24, fontSize: "0.68rem", color: "var(--muted)", left: pct(pop), transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
          Average person
        </span>
        <span style={{ position: "absolute", top: 24, left: 0, fontSize: "0.68rem", color: "var(--muted)" }}>Clears fast</span>
        <span style={{ position: "absolute", top: 24, right: 0, fontSize: "0.68rem", color: "var(--muted)" }}>Clears slowly</span>
      </div>

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <p className="eyebrow" style={{ marginBottom: 4 }}>How much caffeine affects your sleep</p>
        <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 300, letterSpacing: "-0.01em" }}>{sensitivity.label}</p>
        <p className="caption">How much a given amount of caffeine at bedtime delays your sleep, compared with other people.</p>
      </div>

      <p style={{ margin: "24px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
        Estimated from your drinks and sleep. Not medical advice.
      </p>
    </section>
  );
}

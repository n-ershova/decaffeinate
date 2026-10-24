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
    Math.abs(diff) < 0.5 ? "About average" : diff > 0 ? `${diff.toFixed(1)} h slower than average` : `${(-diff).toFixed(1)} h faster than average`;

  return (
    <section>
      <p className="eyebrow">Your caffeine half-life</p>
      <p style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>
        <span style={{ fontSize: "3rem", fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1 }}>{h.mean.toFixed(1)}</span>
        <span style={{ fontSize: "1.1rem", color: "var(--muted)", marginLeft: 4 }}>h</span>
        <span style={{ fontSize: "0.95rem", color: "var(--muted)", marginLeft: 10 }}>± {h.sd.toFixed(1)}</span>
      </p>
      <p style={{ margin: "6px 0 0", fontSize: "0.9rem", color: "var(--muted)" }}>{compare}</p>

      {/* 0–12 h scale: your 80% interval as a band, population average as a tick */}
      <div style={{ position: "relative", height: 36, marginTop: 28 }} aria-hidden>
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, height: 2, background: "var(--border)" }} />
        <div style={{ position: "absolute", top: 10, height: 6, borderRadius: 3, background: "var(--text)", opacity: 0.25,
          left: pct(h.ci80[0]), width: `calc(${pct(h.ci80[1])} - ${pct(h.ci80[0])})` }} />
        <div style={{ position: "absolute", top: 7, width: 12, height: 12, marginLeft: -6, borderRadius: "50%", background: "var(--text)", left: pct(h.mean) }} />
        <div style={{ position: "absolute", top: 4, width: 1, height: 18, background: "var(--muted)", left: pct(pop) }} />
        <span style={{ position: "absolute", top: 24, fontSize: "0.7rem", color: "var(--muted)", left: pct(pop), transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
          Average {pop} h
        </span>
      </div>

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <p className="eyebrow" style={{ marginBottom: 4 }}>Sensitivity</p>
        <p style={{ margin: 0 }}>{sensitivity.label}</p>
      </div>

      <p style={{ margin: "24px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
        Estimated from your drinks and sleep. Not medical advice.
      </p>
    </section>
  );
}

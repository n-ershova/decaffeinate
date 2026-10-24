"use client";

import { useState } from "react";
import { submitSleep } from "@/lib/api";
import { isoLocal } from "@/lib/fixtures";
import { getLightsOut } from "@/lib/lightsOut";

interface Props {
  userId: number;
  night: string; // "YYYY-MM-DD", the evening the user went to bed
  onDone: () => void;
}

/** Bedtime on `night`; times before noon are taken to be after midnight. */
function bedtimeIso(night: string, hhmm: string): string {
  const [y, m, d] = night.split("-").map(Number);
  const [h, min] = hhmm.split(":").map(Number);
  const t = new Date(y, m - 1, d, h, min);
  if (h < 12) t.setDate(t.getDate() + 1);
  return isoLocal(t);
}

export default function MorningCheckin({ userId, night, onDone }: Props) {
  const [bedtime, setBedtime] = useState(() => getLightsOut(night) ?? "23:00");
  const [latency, setLatency] = useState(20);
  const [rested, setRested] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function save() {
    setSaving(true);
    setError(false);
    try {
      await submitSleep({ user_id: userId, night, bedtime: bedtimeIso(night, bedtime), latency_min: latency, rested_1to5: rested });
      onDone();
    } catch {
      setError(true);
      setSaving(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="checkin-title" style={{
      position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center",
      background: "rgb(20 20 19 / 0.35)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    }}>
      <div style={{
        width: "100%", maxWidth: 440, background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: "4px 4px 0 0", padding: "32px 28px calc(28px + env(safe-area-inset-bottom))",
      }} className="sheet">
        <p className="eyebrow">Good morning</p>
        <h2 id="checkin-title" style={{ margin: 0, fontSize: "2rem", fontWeight: 200, letterSpacing: "-0.035em" }}>How did you sleep?</h2>

        <label style={{ display: "block", marginTop: 28 }}>
          <span className="eyebrow" style={{ display: "block" }}>Went to bed</span>
          <input className="field" type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)}
            style={{ fontSize: "1.75rem", colorScheme: "inherit" }} />
        </label>

        <label style={{ display: "block", marginTop: 24 }}>
          <span style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="eyebrow">Time to fall asleep</span>
            <span className="num" style={{ fontSize: "0.8rem" }}>{latency >= 120 ? "2 h+" : `${latency} min`}</span>
          </span>
          <input type="range" min={0} max={120} step={5} value={latency} onChange={(e) => setLatency(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--text)" }} />
        </label>

        <div style={{ marginTop: 20 }}>
          <span className="eyebrow" style={{ display: "block" }}>How rested do you feel?</span>
          <div role="radiogroup" aria-label="Rested, 1 to 5" style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} role="radio" aria-checked={rested === n} className="pill" style={{ flex: 1 }}
                onClick={() => setRested(rested === n ? null : n)}>{n}</button>
            ))}
          </div>
        </div>

        {error && <p style={{ margin: "16px 0 0", fontSize: "0.85rem", color: "var(--red)" }}>Couldn&apos;t save. Try again.</p>}

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28 }}>
          <button className="btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          <button className="link" onClick={onDone} disabled={saving}>Skip</button>
        </div>
      </div>
    </div>
  );
}

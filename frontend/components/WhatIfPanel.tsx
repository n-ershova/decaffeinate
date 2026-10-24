"use client";

import { useRef, useState } from "react";
import CaffeineCurve from "@/components/CaffeineCurve";
import { whatIf } from "@/lib/api";
import type { CurvePoint, WhatIfResponse } from "@/lib/types";

interface Props {
  userId: number;
  baseCurve: CurvePoint[];
  bedtime: string;
  safeLineMg: number;
}

const OPTIONS = [
  { key: "milk_coffee", label: "Coffee", mg: 130 },
  { key: "black_tea", label: "Tea", mg: 47 },
  { key: "energy_drink_500", label: "Energy drink", mg: 160 },
];

export default function WhatIfPanel({ userId, baseCurve, bedtime, safeLineMg }: Props) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  async function pick(opt: (typeof OPTIONS)[number]) {
    const id = ++reqId.current;
    setPicked(opt.key);
    setLoading(true);
    setError(null);
    try {
      const r = await whatIf(userId, opt.key, opt.mg);
      if (id === reqId.current) setResult(r);
    } catch {
      if (id === reqId.current) setError("Couldn't get a prediction. Try again.");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }

  function close() {
    reqId.current++;
    setOpen(false);
    setPicked(null);
    setResult(null);
    setLoading(false);
    setError(null);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={linkButton}>
        Have another one now? <span aria-hidden>→</span>
      </button>
    );
  }

  const x = result?.extra_latency_min;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>Have another one now?</span>
        <button onClick={close} style={{ ...linkButton, fontSize: "0.85rem" }}>Close</button>
      </div>

      <div role="radiogroup" aria-label="Drink" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {OPTIONS.map((o) => {
          const active = picked === o.key;
          return (
            <button
              key={o.key} role="radio" aria-checked={active} onClick={() => pick(o)}
              style={{
                font: "inherit", fontSize: "0.85rem", padding: "6px 14px", borderRadius: 999, cursor: "pointer",
                border: `1px solid ${active ? "var(--text)" : "var(--border)"}`,
                background: active ? "var(--text)" : "transparent",
                color: active ? "var(--bg)" : "var(--text)",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <div style={{ minHeight: 56, marginTop: 24, opacity: loading ? 0.4 : 1, transition: "opacity 0.15s" }}>
        {error && <p style={{ margin: 0, color: "var(--red)", fontSize: "0.9rem" }}>{error}</p>}
        {!error && x && (
          <>
            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 500, letterSpacing: "-0.02em", color: result ? `var(--${result.led_after})` : undefined }}>
              +{Math.round(x.median)} min to fall asleep
              <span style={{ marginLeft: 8, fontSize: "0.9rem", fontWeight: 400, color: "var(--muted)", letterSpacing: 0 }}>
                ({Math.round(x.low)}–{Math.round(x.high)})
              </span>
            </p>
            {result?.cap_exceeded && (
              <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "var(--red)" }}>This would take you over 400 mg today.</p>
            )}
          </>
        )}
        {!error && !x && !loading && <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)" }}>Pick a drink to see the effect on tonight.</p>}
      </div>

      {result && (
        <div style={{ marginTop: 16 }}>
          <CaffeineCurve curve={baseCurve} bedtime={bedtime} safeLineMg={safeLineMg} compareCurve={result.curve} />
        </div>
      )}
    </section>
  );
}

const linkButton: React.CSSProperties = {
  font: "inherit", background: "none", border: 0, padding: 0, cursor: "pointer", color: "var(--text)", justifySelf: "start",
};

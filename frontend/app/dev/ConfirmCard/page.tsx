"use client";

import { useState } from "react";
import ConfirmCard from "@/components/ConfirmCard";
import type { IdentifyResponse } from "@/lib/types";

const AUTO: IdentifyResponse = {
  gemini: { drink: "red_bull", size: null, shots: null, brand: "red bull", decaf: false, label_mg: 80, confidence: 0.97 },
  estimate: { drink_key: "red_bull", label: "Red Bull 250 ml", mg: 80, mg_low: 80, mg_high: 80, needs: [], auto_accept: true },
  logged: { time: "2026-10-24T15:02:00+01:00", user_id: 1, drink_key: "red_bull", mg: 80, mg_low: 80, mg_high: 80, source: "jetson" },
};
const NEEDS: IdentifyResponse = {
  gemini: { drink: "milk_coffee", size: "regular", shots: null, brand: null, decaf: false, label_mg: null, confidence: 0.71 },
  estimate: { drink_key: "milk_coffee", label: "Flat white", mg: 130, mg_low: 100, mg_high: 200, needs: ["shots", "size", "decaf"], auto_accept: false },
};
const UNKNOWN: IdentifyResponse = {
  gemini: { drink: "unknown", size: null, shots: null, brand: null, decaf: false, label_mg: null, confidence: 0.2 },
  estimate: { drink_key: "unknown", label: "Unknown", mg: 0, mg_low: 0, mg_high: 0, needs: [], auto_accept: false },
};

export default function Preview() {
  const [log, setLog] = useState("Nothing yet.");
  const cases: [string, IdentifyResponse][] = [["Auto-accepted", AUTO], ["Needs shots / size / decaf", NEEDS], ["Unknown", UNKNOWN]];
  return (
    <>
      <h1>ConfirmCard</h1>
      <div style={{ maxWidth: 440 }}>
        {cases.map(([name, r]) => (
          <section key={name} style={{ marginTop: 32 }}>
            <p className="eyebrow">{name}</p>
            <ConfirmCard result={r} onConfirm={(d) => setLog(`onConfirm(${JSON.stringify(d)})`)} onCancel={() => setLog(`onCancel() · ${name}`)} />
          </section>
        ))}
        <pre style={{ marginTop: 32, fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "pre-wrap" }}>{log}</pre>
      </div>
    </>
  );
}

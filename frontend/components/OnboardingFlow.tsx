"use client";

import { useState } from "react";
import { createUser, setStoredUserId } from "@/lib/api";
import type { User } from "@/lib/types";

interface Props {
  onDone: (user: User) => void;
}

type Step = "safety" | "stop" | "bedtime" | "smoker" | "contraception";
const ORDER: Step[] = ["bedtime", "smoker", "contraception"];

export default function OnboardingFlow({ onDone }: Props) {
  const [step, setStep] = useState<Step>("safety");
  const [name, setName] = useState("");
  const [bedtime, setBedtime] = useState("23:00");
  const [smoker, setSmoker] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish(hormonal_bc: boolean) {
    setSaving(true);
    setError(null);
    try {
      const user = await createUser({ name: name.trim() || "You", bedtime, smoker: !!smoker, hormonal_bc });
      setStoredUserId(user.id);
      onDone(user);
    } catch {
      setError("Couldn't save. Try again.");
      setSaving(false);
    }
  }

  const index = ORDER.indexOf(step);

  return (
    <div style={{ maxWidth: 420 }}>
      {index >= 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 56 }} aria-label={`Step ${index + 1} of ${ORDER.length}`}>
          {ORDER.map((s, i) => (
            <span key={s} style={{ flex: 1, height: 1, background: i <= index ? "var(--text)" : "var(--border)", transition: "background 0.2s" }} />
          ))}
        </div>
      )}

      {step === "safety" && (
        <Screen
          title="Before we start"
          body="Are any of these true for you? Pregnant or breastfeeding, under 18, a heart condition, or taking medication that interacts with caffeine."
        >
          <button className="btn" onClick={() => setStep("bedtime")}>None of these</button>
          <button className="btn ghost" onClick={() => setStep("stop")}>One or more</button>
        </Screen>
      )}

      {step === "stop" && (
        <Screen
          title="Decaffeinate isn't for you right now"
          body="Its guidance is for healthy adults. Please follow advice from your doctor or midwife on caffeine."
        >
          <button className="link" onClick={() => setStep("safety")}>Go back</button>
        </Screen>
      )}

      {step === "bedtime" && (
        <Screen title="When do you usually go to bed?">
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
            <input className="field" type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} aria-label="Bedtime"
              style={{ fontSize: "3rem", colorScheme: "inherit" }} />
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name (optional)" aria-label="Name" />
            <div><button className="btn" disabled={!bedtime} onClick={() => setStep("smoker")}>Continue</button></div>
          </div>
        </Screen>
      )}

      {step === "smoker" && (
        <Screen title="Do you smoke?" body="Smoking speeds up how fast your body clears caffeine.">
          <button className="btn ghost" onClick={() => { setSmoker(true); setStep("contraception"); }}>Yes</button>
          <button className="btn ghost" onClick={() => { setSmoker(false); setStep("contraception"); }}>No</button>
        </Screen>
      )}

      {step === "contraception" && (
        <Screen title="Do you use hormonal contraception?" body="The pill and similar methods slow caffeine clearance substantially.">
          <button className="btn ghost" disabled={saving} onClick={() => finish(true)}>Yes</button>
          <button className="btn ghost" disabled={saving} onClick={() => finish(false)}>No</button>
          {error && <p style={{ width: "100%", margin: "8px 0 0", fontSize: "0.85rem", color: "var(--red)" }}>{error}</p>}
        </Screen>
      )}

      {index > 0 && (
        <button className="link" style={{ marginTop: 40, fontSize: "0.85rem" }} disabled={saving} onClick={() => setStep(ORDER[index - 1])}>
          ← Back
        </button>
      )}
    </div>
  );
}

function Screen({ title, body, children }: { title: string; body?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ margin: 0, fontSize: "clamp(1.9rem, 6vw, 2.4rem)", fontWeight: 200, letterSpacing: "-0.035em", lineHeight: 1.08 }}>{title}</h2>
      {body && <p style={{ margin: "14px 0 0", color: "var(--muted)", fontSize: "0.95rem", maxWidth: "36ch" }}>{body}</p>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 36 }}>{children}</div>
    </section>
  );
}

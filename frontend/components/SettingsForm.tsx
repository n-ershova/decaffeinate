"use client";

import { useState } from "react";
import { updateUser } from "@/lib/api";
import type { User } from "@/lib/types";

interface Props {
  user: User;
  onSave: (user: User) => void;
}

// §7.8: extra minutes of sleep latency the user will accept from caffeine.
const TOLERANCE = [
  { label: "Strict", min: 5 },
  { label: "Normal", min: 10 },
  { label: "Relaxed", min: 20 },
];

export default function SettingsForm({ user, onSave }: Props) {
  const [bedtime, setBedtime] = useState(user.bedtime.slice(0, 5));
  const [tolerance, setTolerance] = useState(user.tolerance_min);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const dirty = bedtime !== user.bedtime.slice(0, 5) || tolerance !== user.tolerance_min;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    try {
      const updated = await updateUser(user.id, { bedtime, tolerance_min: tolerance });
      setState("saved");
      onSave(updated);
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={save} style={{ maxWidth: 420 }}>
      <label style={{ display: "block" }}>
        <span className="eyebrow" style={{ display: "block" }}>Usual bedtime</span>
        <input className="field" type="time" value={bedtime} required
          onChange={(e) => { setBedtime(e.target.value); setState("idle"); }}
          style={{ fontSize: "2.5rem", colorScheme: "inherit" }} />
      </label>

      <div style={{ marginTop: 32 }}>
        <span className="eyebrow" style={{ display: "block" }}>How strict should the cutoff be?</span>
        <div role="radiogroup" aria-label="Tolerance" style={{ display: "flex", gap: 6 }}>
          {TOLERANCE.map((t) => (
            <button key={t.label} type="button" role="radio" aria-checked={tolerance === t.min} className="pill" style={{ flex: 1 }}
              onClick={() => { setTolerance(t.min); setState("idle"); }}>
              {t.label}
            </button>
          ))}
        </div>
        <p style={{ margin: "10px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
          Accept up to {tolerance} extra minutes to fall asleep.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 32 }}>
        <button className="btn" type="submit" disabled={!dirty || state === "saving"}>
          {state === "saving" ? "Saving…" : "Save"}
        </button>
        {state === "saved" && !dirty && <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Saved</span>}
        {state === "error" && <span style={{ fontSize: "0.85rem", color: "var(--red)" }}>Couldn&apos;t save</span>}
      </div>
    </form>
  );
}

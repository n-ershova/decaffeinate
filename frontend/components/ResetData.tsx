"use client";

import { useState } from "react";

// Forget this device's user; onboarding then creates a fresh one.
const KEYS = ["user_id", "checkin_skipped", "lights_out"];

export default function ResetData() {
  const [confirming, setConfirming] = useState(false);

  function reset() {
    try { KEYS.forEach((k) => localStorage.removeItem(k)); } catch { /* storage unavailable */ }
    // Full navigation so in-memory caches start empty too.
    window.location.assign("/onboarding");
  }

  return (
    <section>
      <p className="eyebrow">Reset</p>
      {confirming ? (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="btn" onClick={reset}>Yes, start over</button>
          <button className="link" onClick={() => setConfirming(false)}>Cancel</button>
        </div>
      ) : (
        <button className="btn ghost" onClick={() => setConfirming(true)}>Reset</button>
      )}
      <p style={{ margin: "10px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
        {confirming ? "Your drinks, check-ins and settings will be cleared." : "Want to start again from a clean slate?"}
      </p>
    </section>
  );
}

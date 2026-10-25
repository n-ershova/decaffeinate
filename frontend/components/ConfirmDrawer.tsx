"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  name: string;
  mg: number;
  low: number;
  high: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

/** Bottom sheet asking to confirm a one-tap log from Common drinks or Your usual. */
export default function ConfirmDrawer({ name, mg, low, high, onConfirm, onCancel }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const confirm = useRef<HTMLButtonElement>(null);

  useEffect(() => { confirm.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !saving) onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, saving]);

  async function save() {
    setSaving(true);
    setError(false);
    try {
      await onConfirm();
    } catch {
      setError(true);
      setSaving(false);
    }
  }

  const range = Math.round(low) !== Math.round(high) ? `${Math.round(low)}–${Math.round(high)} mg` : null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="drawer-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget && !saving) onCancel(); }}>
      <div className="drawer">
        <p className="eyebrow">Log this drink?</p>
        <h2 id="confirm-title" style={{ margin: 0, fontSize: "2rem", fontWeight: 200, letterSpacing: "-0.035em" }}>{name}</h2>
        <p style={{ margin: "12px 0 0", display: "flex", alignItems: "baseline", gap: 10 }}>
          <span className="num" style={{ fontSize: "1.25rem" }}>{Math.round(mg)} mg</span>
          {range && <span className="num" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{range}</span>}
        </p>

        {error && <p style={{ margin: "16px 0 0", fontSize: "0.85rem", color: "var(--red)" }}>Couldn&apos;t save. Try again.</p>}

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28 }}>
          <button ref={confirm} className="btn" onClick={save} disabled={saving}>{saving ? "Logging…" : "Log it"}</button>
          <button className="link" onClick={onCancel} disabled={saving}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

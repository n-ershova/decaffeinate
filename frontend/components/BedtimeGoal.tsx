"use client";

import { useState } from "react";
import { updateUser } from "@/lib/api";

interface Props {
  userId: number;
  bedtime: string; // "HH:MM"
}

export default function BedtimeGoal({ userId, bedtime }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(bedtime.slice(0, 5));
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");

  function openPanel() {
    setValue(bedtime.slice(0, 5));
    setState("idle");
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    try {
      await updateUser(userId, { bedtime: value });
      setOpen(false);
      setState("idle");
    } catch {
      setState("error");
    }
  }

  if (!open) {
    return (
      <button onClick={openPanel} className="btn ghost" style={{ justifySelf: "start" }}>
        Set a bedtime goal
      </button>
    );
  }

  return (
    <form onSubmit={save} style={{ borderTop: "1px solid var(--border)", paddingTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>When do you want to be asleep?</span>
        <button type="button" onClick={() => setOpen(false)} className="link">Close</button>
      </div>

      <input className="field" type="time" value={value} required aria-label="Bedtime goal"
        onChange={(e) => { setValue(e.target.value); setState("idle"); }}
        style={{ fontSize: "2.5rem", colorScheme: "inherit", maxWidth: 420 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 24 }}>
        <button className="btn" type="submit" disabled={!value || value === bedtime.slice(0, 5) || state === "saving"}>
          {state === "saving" ? "Saving…" : "Save"}
        </button>
        {state === "error" && <span style={{ fontSize: "0.85rem", color: "var(--red)" }}>Couldn&apos;t save</span>}
      </div>
    </form>
  );
}

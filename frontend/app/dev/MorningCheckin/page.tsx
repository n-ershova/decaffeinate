"use client";

import { useState } from "react";
import MorningCheckin from "@/components/MorningCheckin";

export default function Preview() {
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState(0);
  return (
    <>
      <h1>MorningCheckin</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>onDone called {done}×</p>
      <button className="pill" onClick={() => setOpen(true)}>Open</button>
      {open && <MorningCheckin userId={1} night="2026-10-23" onDone={() => { setOpen(false); setDone((n) => n + 1); }} />}
    </>
  );
}

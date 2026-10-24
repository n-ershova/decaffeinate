"use client";

import { useState } from "react";
import AlcoholQuickAdd from "@/components/AlcoholQuickAdd";
import PresetGrid from "@/components/PresetGrid";
import { PRESETS } from "@/lib/fixtures";

export default function Preview() {
  const [last, setLast] = useState<string>("Tap something.");
  return (
    <>
      <h1>PresetGrid + AlcoholQuickAdd</h1>
      <div style={{ maxWidth: 560 }}>
        <PresetGrid presets={PRESETS} onPick={(p) => setLast(`onPick(${JSON.stringify(p)})`)} />
        <div style={{ marginTop: 32 }}>
          <AlcoholQuickAdd onAdd={(u) => setLast(`onAdd(${u})`)} />
        </div>
        <pre style={{ marginTop: 32, fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "pre-wrap" }}>{last}</pre>
      </div>
    </>
  );
}

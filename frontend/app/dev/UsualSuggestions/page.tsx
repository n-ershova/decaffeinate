"use client";

import { useEffect, useState } from "react";
import UsualSuggestions from "@/components/UsualSuggestions";
import { fixtureDrinkHistory } from "@/lib/fixtures";
import type { Drink } from "@/lib/types";

export default function Preview() {
  // Built after mount: fixtures depend on the current time, which differs between server and client.
  const [drinks, setDrinks] = useState<Drink[] | null>(null);
  const [log, setLog] = useState("Tap a suggestion.");
  useEffect(() => setDrinks(fixtureDrinkHistory()), []);
  return (
    <>
      <h1>UsualSuggestions</h1>
      {drinks && <UsualSuggestions drinks={drinks} onPick={(d) => setLog(`onPick(${JSON.stringify(d)})`)} />}
      <pre style={{ marginTop: 32, fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "pre-wrap" }}>{log}</pre>
    </>
  );
}

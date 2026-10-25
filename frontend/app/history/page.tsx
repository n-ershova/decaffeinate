"use client";

import { useState } from "react";
import CheckinHistory from "@/components/CheckinHistory";
import DrinkHistory from "@/components/DrinkHistory";
import { deleteDrinks, deleteSleep, getDrinks, getSleep, useApi, useLive, useUserId } from "@/lib/api";

const VIEWS = [
  { key: "drinks", label: "Intake" },
  { key: "sleep", label: "Sleep" },
] as const;

export default function History() {
  const userId = useUserId();
  const [view, setView] = useState<(typeof VIEWS)[number]["key"]>("drinks");
  const [selected, setSelected] = useState<Set<string> | null>(null); // null = not editing
  const [state, setState] = useState<"idle" | "deleting" | "error">("idle");
  const drinks = useApi(userId ? `/drinks?user_id=${userId}` : null, () => getDrinks(userId!));
  const sleep = useApi(userId ? `/sleep?user_id=${userId}` : null, () => getSleep(userId!));
  const current = view === "drinks" ? drinks : sleep;
  // Drinks the desk machine (or another device) logs appear while the page is open.
  // Paused while deleting, so rows being removed don't flash back.
  useLive(current.mutate, 3000, state !== "deleting");

  const stopEditing = () => { setSelected(null); setState("idle"); };

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function remove() {
    if (!selected?.size) return;
    setState("deleting");
    try {
      if (view === "drinks") await deleteDrinks(userId!, [...selected]);
      else await deleteSleep(userId!, [...selected]);
      stopEditing();
    } catch {
      setState("error");
    }
  }

  const sel = selected ?? undefined;
  const hasRows = view === "drinks" ? !!drinks.data?.length : !!sleep.data?.length;

  return (
    <div style={{ display: "grid", gap: 40, maxWidth: 560 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ margin: 0 }}>History</h1>
        {hasRows && (
          <button className="link" onClick={() => (selected ? stopEditing() : setSelected(new Set()))}>
            {selected ? "Done" : "Edit"}
          </button>
        )}
      </div>

      <div role="tablist" aria-label="History" style={{ display: "flex", gap: 6 }}>
        {VIEWS.map((v) => (
          <button key={v.key} role="tab" aria-selected={view === v.key} className="pill" style={{ flex: 1 }}
            onClick={() => { setView(v.key); if (selected) setSelected(new Set()); setState("idle"); }}>
            {v.label}
          </button>
        ))}
      </div>

      {current.error ? <p style={{ color: "var(--muted)" }}>Couldn&apos;t reach the server.</p>
        : view === "drinks" ? (drinks.data ? <DrinkHistory drinks={drinks.data} selected={sel} onToggle={toggle} /> : <p style={{ color: "var(--muted)" }}>Loading…</p>)
        : (sleep.data ? <CheckinHistory checkins={sleep.data} selected={sel} onToggle={toggle} /> : <p style={{ color: "var(--muted)" }}>Loading…</p>)}

      {selected && (
        <div className="action-bar">
          <button className="btn" onClick={remove} disabled={!selected.size || state === "deleting"}>
            {state === "deleting" ? "Deleting…" : `Delete${selected.size ? ` ${selected.size}` : ""}`}
          </button>
          <button className="link" onClick={stopEditing}>Cancel</button>
          {state === "error" && <span style={{ fontSize: "0.85rem", color: "var(--red)" }}>Couldn&apos;t delete</span>}
        </div>
      )}
    </div>
  );
}

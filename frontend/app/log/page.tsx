"use client";

import { useState } from "react";
import AlcoholQuickAdd from "@/components/AlcoholQuickAdd";
import CaptureInput from "@/components/CaptureInput";
import ConfirmCard from "@/components/ConfirmCard";
import PresetGrid from "@/components/PresetGrid";
import UsualSuggestions from "@/components/UsualSuggestions";
import { getDrinks, getPresets, logAlcohol, logDrink, revalidate, useApi, useUserId, type NewDrink } from "@/lib/api";
import type { IdentifyResponse } from "@/lib/types";

const label = (key: string) => key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export default function Log() {
  const userId = useUserId();
  const presets = useApi("/presets", getPresets);
  const history = useApi(userId ? `/drinks?user_id=${userId}` : null, () => getDrinks(userId!));
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function add(d: NewDrink, name: string) {
    setResult(null);
    await logDrink({ ...d, user_id: userId! });
    revalidate("/drinks");
    setToast(`Added ${name}, ${Math.round(d.mg)} mg`);
  }

  async function addAlcohol(units: number) {
    await logAlcohol(units, userId!);
    setToast(`Added ${units} units of alcohol`);
  }

  if (!userId) return null;

  return (
    <div style={{ display: "grid", gap: 40 }}>
      <h1 style={{ margin: 0 }}>Log a drink</h1>

      {result ? (
        <ConfirmCard
          result={result}
          onConfirm={(d) => add(d, result.estimate.label)}
          onCancel={() => setResult(null)}
        />
      ) : (
        <CaptureInput onResult={(r) => { setToast(null); setResult(r); if (r.logged) revalidate("/state"); }} />
      )}

      {toast && <p role="status" style={{ margin: "-24px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>{toast}</p>}

      {history.data && (
        <UsualSuggestions
          drinks={history.data}
          onPick={(d) => add({ drink_key: d.drink_key, mg: d.mg, mg_low: d.mg_low, mg_high: d.mg_high, source: "preset" }, label(d.drink_key))}
        />
      )}

      <div>
        <p className="eyebrow">Common drinks</p>
        {presets.data && (
          <PresetGrid presets={presets.data} onPick={(p) => add({ drink_key: p.key, mg: p.mg, mg_low: p.mg_low, mg_high: p.mg_high, source: "preset" }, p.label)} />
        )}
      </div>

      <AlcoholQuickAdd onAdd={addAlcohol} />
    </div>
  );
}

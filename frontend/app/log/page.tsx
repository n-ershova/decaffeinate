"use client";

import { useState } from "react";
import CaptureInput from "@/components/CaptureInput";
import ConfirmCard from "@/components/ConfirmCard";
import ConfirmDrawer from "@/components/ConfirmDrawer";
import PresetGrid from "@/components/PresetGrid";
import UsualSuggestions from "@/components/UsualSuggestions";
import { getDrinks, getPresets, logDrink, useApi, useUserId, type NewDrink } from "@/lib/api";
import { toast as popup } from "@/lib/toast";
import type { IdentifyResponse } from "@/lib/types";

const label = (key: string) => key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export default function Log() {
  const userId = useUserId();
  const presets = useApi("/presets", getPresets);
  const history = useApi(userId ? `/drinks?user_id=${userId}` : null, () => getDrinks(userId!));
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // A one-tap pick from Your usual or Common drinks, waiting for confirmation.
  const [pending, setPending] = useState<{ drink: NewDrink; name: string } | null>(null);

  async function add(d: NewDrink, name: string) {
    setResult(null);
    await logDrink({ ...d, user_id: userId! });
    setToast(`Added ${name}, ${Math.round(d.mg)} mg`);
  }

  if (!userId) return null;

  return (
    <div style={{ display: "grid", gap: 40 }}>
      <h1 style={{ margin: 0 }}>Log a drink</h1>

      {result ? (
        <ConfirmCard
          result={result}
          onConfirm={async (d) => { await add(d, result.estimate.label); popup("Logged"); }}
          onCancel={() => setResult(null)}
        />
      ) : (
        <CaptureInput
          userId={userId}
          onResult={(r) => { setToast(null); setResult(r); if (r.logged) popup("Logged"); }}
          onManual={(mg, source) => add({ drink_key: "unknown", mg, mg_low: mg, mg_high: mg, source }, "Unknown")}
        />
      )}

      {toast && <p role="status" style={{ margin: "-24px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>{toast}</p>}

      {history.data && (
        <UsualSuggestions
          drinks={history.data}
          onPick={(d) => setPending({ drink: { drink_key: d.drink_key, mg: d.mg, mg_low: d.mg_low, mg_high: d.mg_high, source: "preset" }, name: label(d.drink_key) })}
        />
      )}

      <div>
        <p className="eyebrow">Common drinks</p>
        {presets.data && (
          <PresetGrid presets={presets.data} onPick={(p) => setPending({ drink: { drink_key: p.key, mg: p.mg, mg_low: p.mg_low, mg_high: p.mg_high, source: "preset" }, name: p.label })} />
        )}
      </div>

      {pending && (
        <ConfirmDrawer
          name={pending.name} mg={pending.drink.mg} low={pending.drink.mg_low} high={pending.drink.mg_high}
          onConfirm={async () => { await add(pending.drink, pending.name); setPending(null); popup("Logged"); }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { NewDrink } from "@/lib/api";
import type { IdentifyResponse, Source } from "@/lib/types";

interface Props {
  result: IdentifyResponse;
  onConfirm: (drink: NewDrink) => void;
  onCancel: () => void;
  source?: Source;
}

type Size = "small" | "regular" | "large";

// §6.5: café drinks are stored per shot; regular assumes 2 shots, large 3.
const PER_SHOT = new Set(["espresso_shot", "milk_coffee", "americano", "mocha"]);
const SHOT = { mg: 65, low: 50, high: 100 };
const SIZE_SHOTS: Record<Size, number> = { small: 1, regular: 2, large: 3 };
const SIZE_SCALE: Record<Size, number> = { small: 0.75, regular: 1, large: 1.5 };
const DECAF = { mg: 5, low: 2, high: 15 };

function recalc(base: { mg: number; mg_low: number; mg_high: number }, key: string, baseSize: Size,
                shots: number, size: Size, decaf: boolean) {
  if (decaf) return { mg: DECAF.mg, mg_low: DECAF.low, mg_high: DECAF.high };
  if (PER_SHOT.has(key)) {
    const extra = key === "mocha" ? 10 : 0;
    return { mg: SHOT.mg * shots + extra, mg_low: SHOT.low * shots + extra, mg_high: SHOT.high * shots + extra };
  }
  const k = SIZE_SCALE[size] / SIZE_SCALE[baseSize];
  return { mg: base.mg * k, mg_low: base.mg_low * k, mg_high: base.mg_high * k };
}

export default function ConfirmCard({ result, onConfirm, onCancel, source = "photo" }: Props) {
  const { estimate, gemini, logged } = result;
  const baseSize: Size = gemini.size ?? "regular";
  const [shots, setShots] = useState(gemini.shots ?? SIZE_SHOTS[baseSize]);
  const [size, setSize] = useState<Size>(baseSize);
  const [decaf, setDecaf] = useState(gemini.decaf);

  if (estimate.drink_key === "unknown") {
    return (
      <Card>
        <p style={{ margin: 0, fontSize: "1.1rem" }}>We couldn&apos;t tell what that was.</p>
        <p style={{ margin: "4px 0 16px", fontSize: "0.85rem", color: "var(--muted)" }}>Pick a preset or describe it instead.</p>
        <button className="link" onClick={onCancel}>Dismiss</button>
      </Card>
    );
  }

  if (logged) {
    return (
      <Card>
        <Summary label={estimate.label} mg={logged.mg} low={logged.mg_low} high={logged.mg_high} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Logged</span>
          <button className="link" onClick={onCancel}>Undo</button>
        </div>
      </Card>
    );
  }

  // On café drinks size and shots are the same question, so keep them in step.
  const perShot = PER_SHOT.has(estimate.drink_key);
  const pickSize = (s: Size) => { setSize(s); if (perShot) setShots(SIZE_SHOTS[s]); };
  const pickShots = (n: number) => {
    setShots(n);
    if (perShot) setSize((Object.keys(SIZE_SHOTS) as Size[]).find((k) => SIZE_SHOTS[k] === n) ?? size);
  };
  const v = recalc(estimate, estimate.drink_key, baseSize, shots, size, decaf);
  const needs = new Set(estimate.needs);

  return (
    <Card>
      <Summary label={decaf ? `${estimate.label} (decaf)` : estimate.label} mg={v.mg} low={v.mg_low} high={v.mg_high} />

      {needs.size > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {needs.has("shots") && (
            <Chips label="Shots" options={[[1, "Single"], [2, "Double"], [3, "Triple"]]} value={shots} onPick={pickShots} />
          )}
          {needs.has("size") && (
            <Chips label="Size" options={[["small", "S"], ["regular", "M"], ["large", "L"]]} value={size} onPick={pickSize} />
          )}
          {needs.has("decaf") && (
            <Chips label="Caffeine" options={[[false, "Regular"], [true, "Decaf"]]} value={decaf} onPick={setDecaf} />
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 24 }}>
        <button
          className="btn"
          onClick={() => onConfirm({
            drink_key: decaf ? "decaf" : estimate.drink_key,
            mg: Math.round(v.mg), mg_low: Math.round(v.mg_low), mg_high: Math.round(v.mg_high), source,
          })}
        >
          Log it
        </button>
        <button className="link" onClick={onCancel}>Cancel</button>
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ borderTop: "1px solid var(--text)", borderBottom: "1px solid var(--border)", padding: "20px 0 24px" }}>{children}</div>;
}

function Summary({ label, mg, low, high }: { label: string; mg: number; low: number; high: number }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: "0.95rem" }}>{label}</p>
      <p style={{ margin: "6px 0 0", display: "flex", alignItems: "baseline" }}>
        <span style={{ fontSize: "3rem", lineHeight: 1, fontWeight: 200, letterSpacing: "-0.04em", fontFeatureSettings: '"tnum"' }}>{Math.round(mg)}</span>
        <span style={{ marginLeft: 6, color: "var(--muted)" }}>mg</span>
        {Math.round(low) !== Math.round(high) && (
          <span className="num" style={{ marginLeft: 12, fontSize: "0.75rem", color: "var(--muted)" }}>likely {Math.round(low)}–{Math.round(high)}</span>
        )}
      </p>
    </div>
  );
}

function Chips<T extends string | number | boolean>(
  { label, options, value, onPick }: { label: string; options: [T, string][]; value: T; onPick: (v: T) => void },
) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{ width: 80, fontSize: "0.8rem", color: "var(--muted)" }}>{label}</span>
      {options.map(([v, text]) => (
        <button key={String(v)} role="radio" aria-checked={v === value} className="pill" onClick={() => onPick(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

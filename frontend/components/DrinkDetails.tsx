"use client";

import type { GeminiResult } from "@/lib/types";

const label = (key: string) => key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const muted = { color: "var(--muted)" } as const;

/** Everything Gemini noticed about the drink. Display only: mg comes from the lookup table. */
export default function DrinkDetails({ gemini }: { gemini: GeminiResult }) {
  const a = gemini.analysis;
  if (!a) return null;

  const serving = [
    a.volume_ml ? `${Math.round(a.volume_ml)} ml` : null,
    a.volume_source === "printed" ? "printed" : null,
    gemini.size,
    a.temperature,
  ].filter(Boolean).join(" · ");

  const rows: [string, string | null | undefined][] = [
    ["Brand", gemini.brand],
    ["Product", a.product_name],
    ["Serving", serving],
    ["Milk", a.milk],
    ["Extras", a.additions?.join(", ")],
    ["Shots", gemini.shots ? String(gemini.shots) : null],
    ["On label", a.printed_caffeine],
  ];
  const shown = rows.filter(([, v]) => v);
  const why = (a.evidence?.length ?? 0) + (a.visible_text?.length ?? 0) +
    (a.alternatives?.length ?? 0) + (a.image_issues?.length ?? 0) > 0;

  return (
    <div style={{ marginTop: 16 }}>
      <p className="caption" style={{ margin: 0 }}>{a.description}</p>
      <p className="caption" style={{ margin: "4px 0 0" }}>
        {Math.round(gemini.confidence * 100)}% sure{gemini.decaf ? " · decaf" : ""}
      </p>

      {shown.length > 0 && (
        <dl style={{ display: "grid", gridTemplateColumns: "80px 1fr", rowGap: 6, margin: "16px 0 0", fontSize: "0.85rem" }}>
          {shown.map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <dt style={{ fontSize: "0.8rem", ...muted }}>{k}</dt>
              <dd style={{ margin: 0 }}>{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {why && (
        <details style={{ marginTop: 14, fontSize: "0.82rem" }}>
          <summary className="link" style={{ fontSize: "0.82rem", listStyle: "none" }}>How it decided</summary>
          <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
            {!!a.evidence?.length && <List title="Clues" items={a.evidence} />}
            {!!a.visible_text?.length && (
              <div>
                <p className="eyebrow" style={{ margin: "0 0 4px" }}>Text on it</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {a.visible_text.map((t) => (
                    <span key={t} style={{ fontSize: "0.78rem", padding: "2px 8px", border: "1px solid var(--hairline)", borderRadius: 999 }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
            {!!a.alternatives?.length && (
              <List title="Could also be" items={a.alternatives.map((x) => `${label(x.drink)} · ${Math.round(x.confidence * 100)}%`)} />
            )}
            {!!a.image_issues?.length && <List title="Photo issues" items={a.image_issues} />}
          </div>
        </details>
      )}
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="eyebrow" style={{ margin: "0 0 4px" }}>{title}</p>
      <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
        {items.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Area, ComposedChart, Line, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { CurvePoint } from "@/lib/types";

interface Props {
  curve: CurvePoint[];
  bedtime: string; // "HH:MM"
  safeLineMg: number;
  compareCurve?: CurvePoint[];
}

const HOUR = 3_600_000;
const fmtHour = (ms: number) => String(new Date(ms).getHours()).padStart(2, "0");
const fmtTime = (ms: number) =>
  new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

/** First occurrence of "HH:MM" local time within [from, to], else null. */
function bedtimeMs(bedtime: string, from: number, to: number): number | null {
  const [h, m] = bedtime.split(":").map(Number);
  const d = new Date(from);
  d.setHours(h, m, 0, 0);
  if (d.getTime() < from) d.setDate(d.getDate() + 1);
  return d.getTime() <= to ? d.getTime() : null;
}

/** Whole-hour ticks every `step` hours, so the axis reads 18 · 22 · 02 · 06 rather than 18:52. */
function hourTicks(from: number, to: number, step = 4): number[] {
  const d = new Date(from);
  d.setMinutes(0, 0, 0);
  d.setHours(Math.ceil((d.getHours() + (from > d.getTime() ? 1 : 0)) / step) * step);
  const out: number[] = [];
  for (let t = d.getTime(); t <= to; t += step * HOUR) if (t >= from) out.push(t);
  return out;
}

const MUTED = "var(--muted)";

export type Crossing = { t: number; down: boolean }; // down: drops to sleep-safe here

/** Where the curve crosses the sleep-safe line, interpolated between points. */
export function crossings(curve: CurvePoint[], safeLineMg: number): Crossing[] {
  const pts = curve.map((p) => ({ t: new Date(p.t).getTime(), mg: p.mg }));
  const out: Crossing[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (a.mg > safeLineMg !== b.mg > safeLineMg) {
      const t = a.t + ((safeLineMg - a.mg) / (b.mg - a.mg || 1)) * (b.t - a.t);
      out.push({ t, down: b.mg <= safeLineMg });
    }
  }
  return out;
}

/**
 * Horizontal gradient stops that colour the area under the curve red while it is above the
 * sleep-safe line and green once it's at or below it, switching exactly where it crosses.
 */
export function safeStops(curve: CurvePoint[], safeLineMg: number): { offset: number; above: boolean }[] {
  const t0 = new Date(curve[0].t).getTime();
  const span = new Date(curve[curve.length - 1].t).getTime() - t0 || 1;
  const stops = [{ offset: 0, above: curve[0].mg > safeLineMg }];
  for (const c of crossings(curve, safeLineMg)) {
    const offset = (c.t - t0) / span;
    stops.push({ offset, above: c.down }, { offset, above: !c.down });   // hard switch
  }
  stops.push({ offset: 1, above: stops[stops.length - 1].above });
  return stops;
}

const SNAP = 0.04;   // the cursor locks onto a crossing within 4% of the chart's width

export default function CaffeineCurve({ curve, bedtime, safeLineMg, compareCurve }: Props) {
  const [snap, setSnap] = useState<Crossing | null>(null);
  if (curve.length === 0) return <div style={{ color: MUTED }}>No curve yet.</div>;

  // Merge on time: the compare curve may come from a later request, so its steps needn't line up.
  type Row = { t: number; mg?: number; compare?: number };
  const rows = new Map<number, Row>();
  const put = (p: CurvePoint, k: "mg" | "compare") => {
    const t = new Date(p.t).getTime();
    rows.set(t, { ...(rows.get(t) ?? { t }), [k]: p.mg });
  };
  curve.forEach((p) => put(p, "mg"));
  compareCurve?.forEach((p) => put(p, "compare"));
  const data = [...rows.values()].sort((a, b) => a.t - b.t);
  const start = { t: new Date(curve[0].t).getTime(), mg: curve[0].mg };
  const end = new Date(curve[curve.length - 1].t).getTime();
  const bed = bedtimeMs(bedtime, start.t, end);
  const peak = Math.max(...data.map((d) => Math.max(d.mg ?? 0, d.compare ?? 0)), safeLineMg);
  const top = Math.ceil((peak * 1.1) / 50) * 50;
  const zones = safeStops(curve, safeLineMg);
  const cross = crossings(curve, safeLineMg);
  const snapTo = (t: number) => cross.find((c) => Math.abs(c.t - t) <= SNAP * (end - start.t)) ?? null;

  return (
    <figure style={{ margin: 0 }}>
      <figcaption>
        <p style={{ margin: 0, fontSize: "0.95rem" }}>
          Caffeine in your body now <span className="num" style={{ marginLeft: 6 }}>{Math.round(start.mg)} mg</span>
        </p>
        <p className="caption">
          The line shows it wearing off between now and tomorrow morning. Once it drops below the
          dotted <strong>sleep-safe line</strong>, it&apos;s low enough not to keep you awake.
        </p>
        <span style={{ display: "flex", gap: 16, marginTop: 14, fontSize: "0.78rem", color: MUTED }}>
          <Legend color="var(--text)" label="Caffeine" />
          {compareCurve && <Legend color="var(--red)" dashed label="If you have another" />}
          <Legend color="var(--green)" dashed label="Sleep-safe" />
          {bed !== null && <Legend color={MUTED} label="Bedtime" />}
        </span>
      </figcaption>

      <div style={{ width: "100%", height: 220, marginTop: 12 }}>
        <ResponsiveContainer>
          <ComposedChart
            data={data} margin={{ top: 18, right: 2, bottom: 0, left: 2 }}
            onMouseMove={(state) => {
              const t = Number(state?.activeLabel);
              setSnap(state?.isTooltipActive && Number.isFinite(t) ? snapTo(t) : null);
            }}
            onMouseLeave={() => setSnap(null)}
          >
            <defs>
              {/* Left to right along time: red while above the sleep-safe line, green once below. */}
              <linearGradient id="mgFill" x1="0" y1="0" x2="1" y2="0">
                {zones.map((z, i) => (
                  <stop key={i} offset={z.offset} stopColor={z.above ? "var(--red)" : "var(--green)"} stopOpacity={0.22} />
                ))}
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t" type="number" scale="time" domain={[start.t, end]}
              ticks={hourTicks(start.t, end)} tickFormatter={fmtHour}
              stroke={MUTED} tick={{ fontSize: 10.5 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} tickMargin={10}
            />
            <YAxis hide domain={[0, top]} />
            <Tooltip
              active={snap ? false : undefined}   // hidden while snapped to a crossing
              cursor={{ stroke: MUTED, strokeWidth: 1 }}
              labelFormatter={(v) => fmtTime(Number(v))}
              formatter={(v, name) => [`${Math.round(Number(v))} mg`, name === "compare" ? "If you have another" : "Caffeine"]}
              contentStyle={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 2, fontSize: 11, boxShadow: "none", padding: "6px 10px" }}
              itemStyle={{ color: "var(--text)", padding: 0 }}
              labelStyle={{ color: MUTED, marginBottom: 2 }}
            />
            <ReferenceLine y={safeLineMg} stroke="var(--green)" strokeDasharray="2 4" />
            {bed !== null && (
              <ReferenceLine
                x={bed} stroke={MUTED} strokeOpacity={0.6}
                label={{ value: `Bed ${bedtime}`, fill: MUTED, fontSize: 10.5, position: "insideTopRight", offset: 6 }}
              />
            )}
            <Area
              type="monotone" dataKey="mg" name="mg" stroke="var(--text)" strokeWidth={1.25}
              fill="url(#mgFill)" connectNulls isAnimationActive={false} activeDot={{ r: 2.5, strokeWidth: 0, fill: "var(--text)" }}
            />
            {compareCurve && (
              <Line
                type="monotone" dataKey="compare" name="compare" stroke="var(--red)" strokeWidth={1.25}
                strokeDasharray="3 3" dot={false} connectNulls isAnimationActive={false}
                activeDot={{ r: 2.5, strokeWidth: 0, fill: "var(--red)" }}
              />
            )}
            <ReferenceDot x={start.t} y={start.mg} r={3} fill="var(--text)" stroke="var(--bg)" strokeWidth={2} />
            {snap && (
              <ReferenceLine x={snap.t} stroke={MUTED} strokeWidth={1} />
            )}
            {snap && (
              <ReferenceDot
                x={snap.t} y={safeLineMg} r={4} fill={snap.down ? "var(--green)" : "var(--red)"} stroke="var(--bg)" strokeWidth={2}
                label={{ value: `${snap.down ? "Sleep-safe from" : "Over the safe line from"} ${fmtTime(snap.t)}`,
                  position: "top", offset: 10, fill: "var(--text)", fontSize: 11,
                  // A halo in the page colour keeps the line from running through the text.
                  stroke: "var(--bg)", strokeWidth: 5, paintOrder: "stroke" }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 12, height: 0, borderTop: `1px ${dashed ? "dashed" : "solid"} ${color}` }} />
      {label}
    </span>
  );
}

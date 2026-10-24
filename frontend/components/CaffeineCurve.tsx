"use client";

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

export default function CaffeineCurve({ curve, bedtime, safeLineMg, compareCurve }: Props) {
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

  return (
    <figure style={{ margin: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <span style={{ fontSize: "2.25rem", fontWeight: 600, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>
            {Math.round(start.mg)}
          </span>
          <span style={{ color: MUTED, fontSize: "0.9rem", marginLeft: 6 }}>mg in your system</span>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: "0.75rem", color: MUTED }}>
          {compareCurve && <Legend color="var(--red)" dashed label="If you have it" />}
          <Legend color="var(--green)" dashed label="Safe line" />
        </div>
      </div>

      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 16, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="mgFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--text)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--text)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t" type="number" scale="time" domain={[start.t, end]}
              ticks={hourTicks(start.t, end)} tickFormatter={fmtHour}
              stroke={MUTED} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={10}
            />
            <YAxis hide domain={[0, Math.ceil((peak * 1.1) / 50) * 50]} />
            <Tooltip
              cursor={{ stroke: MUTED, strokeWidth: 1, strokeDasharray: "2 3" }}
              labelFormatter={(v) => fmtTime(Number(v))}
              formatter={(v, name) => [`${Math.round(Number(v))} mg`, name === "compare" ? "If you have it" : "Now"]}
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, boxShadow: "none", padding: "6px 10px" }}
              itemStyle={{ color: "var(--text)", padding: 0 }}
              labelStyle={{ color: MUTED, marginBottom: 2 }}
            />
            <ReferenceLine y={safeLineMg} stroke="var(--green)" strokeOpacity={0.7} strokeDasharray="3 4" />
            {bed !== null && (
              <ReferenceLine
                x={bed} stroke={MUTED} strokeOpacity={0.5}
                label={{ value: `Bed ${bedtime}`, fill: MUTED, fontSize: 11, position: "insideTopRight", offset: 6 }}
              />
            )}
            <Area
              type="monotone" dataKey="mg" name="mg" stroke="var(--text)" strokeWidth={1.5}
              fill="url(#mgFill)" connectNulls isAnimationActive={false} activeDot={{ r: 3, strokeWidth: 0, fill: "var(--text)" }}
            />
            {compareCurve && (
              <Line
                type="monotone" dataKey="compare" name="compare" stroke="var(--red)" strokeWidth={1.5}
                strokeDasharray="4 4" dot={false} connectNulls isAnimationActive={false}
                activeDot={{ r: 3, strokeWidth: 0, fill: "var(--red)" }}
              />
            )}
            <ReferenceDot x={start.t} y={start.mg} r={3.5} fill="var(--text)" stroke="var(--bg)" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 14, height: 0, borderTop: `1.5px ${dashed ? "dashed" : "solid"} ${color}` }} />
      {label}
    </span>
  );
}

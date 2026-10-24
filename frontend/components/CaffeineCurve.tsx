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
      <figcaption style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, fontSize: "0.8rem", color: MUTED }}>
        <span>
          In your system now <span className="num" style={{ color: "var(--text)", marginLeft: 6 }}>{Math.round(start.mg)} mg</span>
        </span>
        <span style={{ display: "flex", gap: 16 }}>
          {compareCurve && <Legend color="var(--red)" dashed label="With another" />}
          <Legend color="var(--green)" dashed label="Sleep-safe" />
        </span>
      </figcaption>

      <div style={{ width: "100%", height: 220, marginTop: 12 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 18, right: 2, bottom: 0, left: 2 }}>
            <defs>
              <linearGradient id="mgFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--text)" stopOpacity={0.07} />
                <stop offset="100%" stopColor="var(--text)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t" type="number" scale="time" domain={[start.t, end]}
              ticks={hourTicks(start.t, end)} tickFormatter={fmtHour}
              stroke={MUTED} tick={{ fontSize: 10.5 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} tickMargin={10}
            />
            <YAxis hide domain={[0, Math.ceil((peak * 1.1) / 50) * 50]} />
            <Tooltip
              cursor={{ stroke: MUTED, strokeWidth: 1 }}
              labelFormatter={(v) => fmtTime(Number(v))}
              formatter={(v, name) => [`${Math.round(Number(v))} mg`, name === "compare" ? "With another" : "Now"]}
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

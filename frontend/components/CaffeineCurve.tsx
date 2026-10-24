"use client";

import {
  Area, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { CurvePoint } from "@/lib/types";

interface Props {
  curve: CurvePoint[];
  bedtime: string; // "HH:MM"
  safeLineMg: number;
  compareCurve?: CurvePoint[];
}

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

export default function CaffeineCurve({ curve, bedtime, safeLineMg, compareCurve }: Props) {
  if (curve.length === 0) return <div className="card">No curve yet.</div>;

  const compare = new Map(compareCurve?.map((p) => [new Date(p.t).getTime(), p.mg]));
  const data = curve.map((p) => {
    const t = new Date(p.t).getTime();
    return { t, mg: p.mg, compare: compare.get(t) };
  });
  const start = data[0].t;
  const end = data[data.length - 1].t;
  const bed = bedtimeMs(bedtime, start, end);
  const peak = Math.max(...data.map((d) => Math.max(d.mg, d.compare ?? 0)), safeLineMg);

  return (
    <div className="card" style={{ padding: "16px 8px 8px 0" }}>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="mgFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t" type="number" scale="time" domain={[start, end]}
              tickFormatter={fmtTime} tickCount={6}
              stroke="var(--muted)" tick={{ fontSize: 12 }} axisLine={{ stroke: "var(--border)" }} tickLine={false}
            />
            <YAxis
              domain={[0, Math.ceil((peak * 1.1) / 50) * 50]} width={44} unit=" mg"
              stroke="var(--muted)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false}
            />
            <Tooltip
              labelFormatter={(v) => fmtTime(Number(v))}
              formatter={(v, name) => [`${Math.round(Number(v))} mg`, name === "compare" ? "If you have it" : "Now"]}
              contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }}
            />
            <Area type="monotone" dataKey="mg" name="mg" stroke="var(--accent)" strokeWidth={2} fill="url(#mgFill)" isAnimationActive={false} />
            {compareCurve && (
              <Line
                type="monotone" dataKey="compare" name="compare" stroke="var(--red)" strokeWidth={2}
                strokeDasharray="6 4" dot={false} isAnimationActive={false}
              />
            )}
            <ReferenceLine
              y={safeLineMg} stroke="var(--green)" strokeDasharray="4 4"
              label={{ value: `Safe line ${Math.round(safeLineMg)} mg`, fill: "var(--green)", fontSize: 12, position: "insideTopRight" }}
            />
            {bed !== null && (
              <ReferenceLine
                x={bed} stroke="var(--muted)"
                label={{ value: `Bed ${bedtime}`, fill: "var(--muted)", fontSize: 12, position: "insideTopLeft" }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

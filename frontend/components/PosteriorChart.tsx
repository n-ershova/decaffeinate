"use client";

import { Area, AreaChart, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProfileResponse } from "@/lib/types";

interface Props {
  history: ProfileResponse["history"];
  posterior: ProfileResponse["posterior"];
}

const MUTED = "var(--muted)";
const POP_H = 5;
const fmtNight = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString([], { day: "numeric", month: "short" });
const axis = { stroke: MUTED, tick: { fontSize: 10.5 }, axisLine: false, tickLine: false } as const;
const tooltipStyle = {
  contentStyle: { background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 2, fontSize: 11, padding: "6px 10px", boxShadow: "none" },
  itemStyle: { color: "var(--text)", padding: 0 },
  labelStyle: { color: MUTED, marginBottom: 2 },
};

export default function PosteriorChart({ history, posterior }: Props) {
  const band = history.map((n) => ({ night: n.night, mean: n.h_mean, range: [n.h_low, n.h_high] as [number, number] }));
  const density = posterior.h_grid.map((h, i) => ({ h, p: posterior.prob[i] })).filter((d) => d.h <= 14);
  const yMax = Math.ceil(Math.max(...history.map((n) => n.h_high), POP_H + 1));

  return (
    <>
    <section className="segment">
      <p className="eyebrow" style={{ marginBottom: 0 }}>Getting more certain each night</p>
      <p className="caption" style={{ marginTop: 4, marginBottom: 16 }}>The band narrows with each check-in.</p>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <ComposedChart data={band} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <XAxis dataKey="night" tickFormatter={fmtNight} interval="preserveStartEnd" minTickGap={40} tickMargin={8} {...axis} />
            <YAxis domain={[0, yMax]} unit="h" width={40} tickCount={4} {...axis} />
            <Tooltip
              {...tooltipStyle}
              labelFormatter={(v) => fmtNight(String(v))}
              formatter={(v, name) => (name === "range"
                ? [`${(v as number[])[0].toFixed(1)}–${(v as number[])[1].toFixed(1)} h`, "Likely range"]
                : [`${Number(v).toFixed(1)} h`, "Best guess"])}
            />
            <ReferenceLine y={POP_H} stroke={MUTED} strokeDasharray="3 4" strokeOpacity={0.6}
              label={{ value: "Average", fill: MUTED, fontSize: 11, position: "insideBottomRight" }} />
            <Area dataKey="range" name="range" stroke="none" fill="var(--text)" fillOpacity={0.08} isAnimationActive={false} />
            <Line dataKey="mean" name="mean" stroke="var(--text)" strokeWidth={1.25} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </section>

    <section className="segment">
      <p className="eyebrow" style={{ marginBottom: 0 }}>Our best guess today</p>
      <p className="caption" style={{ marginTop: 4, marginBottom: 16 }}>A narrower peak means more confident.</p>
      <div style={{ width: "100%", height: 100 }}>
        <ResponsiveContainer>
          <AreaChart data={density} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <XAxis dataKey="h" type="number" domain={[1.5, 14]} ticks={[2, 4, 6, 8, 10, 12, 14]} unit="h" tickMargin={6} {...axis} />
            <YAxis hide />
            <ReferenceLine x={POP_H} stroke={MUTED} strokeDasharray="3 4" strokeOpacity={0.6} />
            <Area type="monotone" dataKey="p" stroke="var(--text)" strokeWidth={1.25} fill="var(--text)" fillOpacity={0.06} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
    </>
  );
}

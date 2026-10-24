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
const axis = { stroke: MUTED, tick: { fontSize: 11 }, axisLine: false, tickLine: false } as const;
const tooltipStyle = {
  contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, padding: "6px 10px" },
  itemStyle: { color: "var(--text)", padding: 0 },
  labelStyle: { color: MUTED, marginBottom: 2 },
};

export default function PosteriorChart({ history, posterior }: Props) {
  const band = history.map((n) => ({ night: n.night, mean: n.h_mean, range: [n.h_low, n.h_high] as [number, number] }));
  const density = posterior.h_grid.map((h, i) => ({ h, p: posterior.prob[i] })).filter((d) => d.h <= 14);
  const yMax = Math.ceil(Math.max(...history.map((n) => n.h_high), POP_H + 1));

  return (
    <section>
      <p className="eyebrow">Your estimate, night by night</p>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <ComposedChart data={band} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
            <XAxis dataKey="night" tickFormatter={fmtNight} interval="preserveStartEnd" minTickGap={40} tickMargin={8} {...axis} />
            <YAxis domain={[0, yMax]} unit="h" width={40} tickCount={4} {...axis} />
            <Tooltip
              {...tooltipStyle}
              labelFormatter={(v) => fmtNight(String(v))}
              formatter={(v, name) => (name === "range"
                ? [`${(v as number[])[0].toFixed(1)}–${(v as number[])[1].toFixed(1)} h`, "80% range"]
                : [`${Number(v).toFixed(1)} h`, "Estimate"])}
            />
            <ReferenceLine y={POP_H} stroke={MUTED} strokeDasharray="3 4" strokeOpacity={0.6}
              label={{ value: "Average", fill: MUTED, fontSize: 11, position: "insideBottomRight" }} />
            <Area dataKey="range" name="range" stroke="none" fill="var(--text)" fillOpacity={0.12} isAnimationActive={false} />
            <Line dataKey="mean" name="mean" stroke="var(--text)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="eyebrow" style={{ marginTop: 32 }}>Where your half-life probably is</p>
      <div style={{ width: "100%", height: 100 }}>
        <ResponsiveContainer>
          <AreaChart data={density} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
            <XAxis dataKey="h" type="number" domain={[1.5, 14]} ticks={[2, 4, 6, 8, 10, 12, 14]} unit="h" tickMargin={6} {...axis} />
            <YAxis hide />
            <ReferenceLine x={POP_H} stroke={MUTED} strokeDasharray="3 4" strokeOpacity={0.6} />
            <Area type="monotone" dataKey="p" stroke="var(--text)" strokeWidth={1.5} fill="var(--text)" fillOpacity={0.1} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

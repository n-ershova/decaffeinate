"use client";

import { useEffect, useRef, useState } from "react";
import { Area, ComposedChart, Line, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { getProfile, getState, seedDemo } from "@/lib/api";
import type { DemoSeedResponse, ProfileResponse, StateResponse } from "@/lib/types";

type Sim = DemoSeedResponse["users"][number] & { profile: ProfileResponse; state: StateResponse };

const STEP_MS = 350;

export default function DemoSwitcher() {
  const [sims, setSims] = useState<Sim[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [night, setNight] = useState(1);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const nights = sims ? Math.min(...sims.map((s) => s.profile.history.length)) : 0;

  async function seed() {
    setLoading(true);
    setError(false);
    try {
      const { users } = await seedDemo();
      const pair = users.slice(0, 2);
      const full = await Promise.all(pair.map(async (u) => ({ ...u, profile: await getProfile(u.id), state: await getState(u.id) })));
      setSims(full);
      setNight(1);
      setPlaying(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setNight((n) => {
        if (n >= nights) { setPlaying(false); return n; }
        return n + 1;
      });
    }, STEP_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, nights]);

  if (!sims) {
    return (
      <section style={{ maxWidth: 440 }}>
        <p style={{ margin: "0 0 20px", color: "var(--muted)" }}>
          Two made-up people drink exactly the same coffee every day, but one body clears caffeine quickly and the other
          slowly. Press play to watch the app work out which is which from their sleep alone.
        </p>
        <button className="btn" onClick={seed} disabled={loading}>{loading ? "Seeding…" : "Seed demo"}</button>
        {error && <p style={{ margin: "12px 0 0", fontSize: "0.85rem", color: "var(--red)" }}>Couldn&apos;t seed the demo.</p>}
      </section>
    );
  }

  const yMax = Math.ceil(Math.max(...sims.flatMap((s) => s.profile.history.map((n) => n.h_high)), ...sims.map((s) => s.true_h)) + 0.5);

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button className="pill" onClick={() => { if (night >= nights) setNight(1); setPlaying(!playing); }} style={{ width: 72 }}>
          {playing ? "Pause" : night >= nights ? "Replay" : "Play"}
        </button>
        <input type="range" min={1} max={nights} value={night} aria-label="Night"
          onChange={(e) => { setPlaying(false); setNight(Number(e.target.value)); }}
          style={{ flex: 1, minWidth: 160, accentColor: "var(--text)" }} />
        <span className="num" style={{ fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap", textAlign: "right" }}>
          Night {night}/{nights}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 32, marginTop: 32 }}>
        {sims.map((s) => {
          const now = s.profile.history[night - 1];
          return (
            <article key={s.id} style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 400 }}>{s.name}</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  Simulated data
                </span>
              </div>
              <p style={{ margin: "20px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>Last coffee by</p>
              <p style={{ margin: "2px 0 0", fontSize: "3.5rem", lineHeight: 1, fontWeight: 200, letterSpacing: "-0.05em", fontFeatureSettings: '"tnum"', color: `var(--${s.state.led})` }}>
                {s.state.cutoff ?? "—"}
              </p>
              <p className="num" style={{ margin: "12px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
                Estimate {now.h_mean.toFixed(1)} h ({now.h_low.toFixed(1)}–{now.h_high.toFixed(1)}) · true {s.true_h} h
              </p>
              <MiniBand history={s.profile.history.slice(0, night)} total={nights} trueH={s.true_h} yMax={yMax} />
              <p className="caption">Line: the app&apos;s guess for how many hours it takes this person to clear half their caffeine. Dotted: the true answer.</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MiniBand({ history, total, trueH, yMax }: { history: ProfileResponse["history"]; total: number; trueH: number; yMax: number }) {
  const data = history.map((n, i) => ({ i: i + 1, mean: n.h_mean, range: [n.h_low, n.h_high] }));
  return (
    <div style={{ width: "100%", height: 160, marginTop: 16 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="i" type="number" domain={[1, total]} hide />
          <YAxis domain={[0, yMax]} unit="h" width={36} tickCount={4} stroke="var(--muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <ReferenceLine y={trueH} stroke="var(--muted)" strokeDasharray="3 4" strokeOpacity={0.7} />
          <Area dataKey="range" stroke="none" fill="var(--text)" fillOpacity={0.12} isAnimationActive={false} />
          <Line dataKey="mean" stroke="var(--text)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { clearLightsOut, getLightsOut, nightOf, setLightsOut } from "@/lib/lightsOut";
import { toast } from "@/lib/toast";

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const HERO: React.CSSProperties = {
  margin: "6px 0 0 -0.04em", fontSize: "clamp(5.5rem, 26vw, 9.5rem)", lineHeight: 0.92, fontWeight: 200,
  letterSpacing: "-0.055em", fontFeatureSettings: '"tnum"',
};

function Eyebrow({ filled, children }: { filled: boolean; children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem", color: "var(--muted)" }}>
      <span aria-hidden style={{
        width: 7, height: 7, borderRadius: "50%", border: `1px solid ${filled ? "var(--night)" : "var(--ink)"}`,
        background: filled ? "var(--night)" : "linear-gradient(90deg, var(--ink) 50%, transparent 50%)",
      }} />
      {children}
    </p>
  );
}

export default function Sleep() {
  const [now, setNow] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    setNow(new Date());
    setTime(getLightsOut(nightOf(new Date())));
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return time
    ? <LightsOut time={time} onUndo={() => { clearLightsOut(); setTime(null); }} />
    : <GoingToSleep now={now} onPress={() => { setTime(setLightsOut(new Date())); toast("Logged"); }} />;
}

function LightsOut({ time, onUndo }: { time: string; onUndo: () => void }) {
  return (
    <div style={{ display: "grid", gap: 40, maxWidth: 480 }}>
      <header>
        <Eyebrow filled>Lights out at</Eyebrow>
        <p style={{ ...HERO, color: "var(--night)" }}>{time}</p>
      </header>
      <section style={{ borderTop: "1px solid var(--border)", paddingTop: 24 }}>
        <p style={{ margin: 0, fontSize: "0.95rem" }}>Sleep well.</p>
        <p className="caption">We&apos;ll ask how it went in the morning.</p>
        <button className="link" style={{ marginTop: 20 }} onClick={onUndo}>
          Undo
        </button>
      </section>
    </div>
  );
}

function GoingToSleep({ now, onPress }: { now: Date; onPress: () => void }) {
  return (
    <div style={{ display: "grid", gap: 40, maxWidth: 480 }}>
      <header>
        <Eyebrow filled={false}>It&apos;s now</Eyebrow>
        <p style={HERO}>{hhmm(now)}</p>
      </header>
      <section style={{ borderTop: "1px solid var(--border)", paddingTop: 24 }}>
        <button className="btn" onClick={onPress} style={{ background: "var(--paper)", color: "var(--ink)", border: "0.5px solid var(--ink)" }}>
          Going to sleep
        </button>
        <p className="caption" style={{ marginTop: 14 }}>
          Press this once the lights are off and you&apos;re ready to fall asleep. It fills in tomorrow&apos;s check-in for you.
        </p>
      </section>
    </div>
  );
}

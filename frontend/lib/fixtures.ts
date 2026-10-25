import type {
  Alcohol, Drink, HrCheck, IdentifyResponse, MachineLog, Preset, ProfileResponse, SleepNight,
  StateResponse, User, WhatIfResponse, CurvePoint,
} from "./types";

const MIN = 60_000;
const HALF_LIFE_H = 5; // population default, as in backend/model.py

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO 8601 with local offset, e.g. 2026-10-24T16:00:00+01:00 */
export function isoLocal(d: Date): string {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const a = Math.abs(off);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`
  );
}

const dateOnly = (d: Date) => isoLocal(d).slice(0, 10);

/** First 08:00 strictly after `from`. */
function nextEight(from: Date): Date {
  const d = new Date(from);
  d.setHours(8, 0, 0, 0);
  if (d <= from) d.setDate(d.getDate() + 1);
  return d;
}

/** Mg in body at `t` from a set of drinks, first-order decay with half-life h. */
function amountAt(drinks: Drink[], t: Date, h: number): number {
  let total = 0;
  for (const d of drinks) {
    const dt = (t.getTime() - new Date(d.time).getTime()) / (60 * MIN);
    if (dt >= 0) total += d.mg * Math.pow(0.5, dt / h);
  }
  return total;
}

export function buildCurve(drinks: Drink[], now: Date, h = HALF_LIFE_H): CurvePoint[] {
  const end = nextEight(now);
  const out: CurvePoint[] = [];
  for (let t = now.getTime(); t <= end.getTime(); t += 15 * MIN) {
    out.push({ t: isoLocal(new Date(t)), mg: Math.round(amountAt(drinks, new Date(t), h)) });
  }
  return out;
}

export const MOCK_USER: User = {
  id: 1, name: "Alex", bedtime: "23:30", smoker: false, hormonal_bc: false,
  tolerance_min: 10, is_simulated: false,
};

export const PRESETS: Preset[] = [
  { key: "espresso_shot", label: "Espresso shot", mg: 63, mg_low: 50, mg_high: 75 },
  { key: "milk_coffee", label: "Latte / flat white", mg: 130, mg_low: 90, mg_high: 180 },
  { key: "americano", label: "Americano", mg: 150, mg_low: 100, mg_high: 200 },
  { key: "filter_coffee", label: "Filter coffee", mg: 140, mg_low: 95, mg_high: 200 },
  { key: "cold_brew", label: "Cold brew", mg: 200, mg_low: 150, mg_high: 280 },
  { key: "black_tea", label: "Black tea", mg: 47, mg_low: 30, mg_high: 70 },
  { key: "green_tea", label: "Green tea", mg: 28, mg_low: 20, mg_high: 45 },
  { key: "matcha", label: "Matcha", mg: 70, mg_low: 40, mg_high: 90 },
  { key: "cola", label: "Cola", mg: 34, mg_low: 30, mg_high: 40 },
  { key: "red_bull", label: "Red Bull", mg: 80, mg_low: 75, mg_high: 85 },
  { key: "energy_drink_500", label: "Energy drink (500 ml)", mg: 160, mg_low: 140, mg_high: 200 },
  { key: "decaf", label: "Decaf", mg: 7, mg_low: 2, mg_high: 15 },
];

/** A realistic day: morning flat white, post-lunch americano. Amber state. */
export function fixtureDrinksToday(now = new Date()): Drink[] {
  const at = (h: number, m: number) => {
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    if (d > now) d.setDate(d.getDate() - 1); // never in the future
    return isoLocal(d);
  };
  return [
    { time: at(8, 15), user_id: 1, drink_key: "milk_coffee", mg: 130, mg_low: 90, mg_high: 180, source: "preset" },
    { time: at(13, 5), user_id: 1, drink_key: "americano", mg: 150, mg_low: 100, mg_high: 200, source: "photo" },
  ];
}

/** 14 days of history, a few drinks a day, for `GET /drinks` and `UsualSuggestions`. */
export function fixtureDrinkHistory(now = new Date()): Drink[] {
  const out: Drink[] = [];
  for (let day = 13; day >= 1; day--) {
    const base = new Date(now);
    base.setDate(base.getDate() - day);
    const mk = (h: number, m: number, key: string, mg: number): Drink => {
      const t = new Date(base);
      t.setHours(h, m, 0, 0);
      return { time: isoLocal(t), user_id: 1, drink_key: key, mg, mg_low: mg * 0.7, mg_high: mg * 1.3, source: "preset" };
    };
    out.push(mk(8, 20, "milk_coffee", 130));
    if (day % 3 !== 0) out.push(mk(13, 0, "americano", 150));
    if (day % 4 === 0) out.push(mk(16, 30, "black_tea", 47));
  }
  return [...out, ...fixtureDrinksToday(now)];
}

/**
 * Move a cutoff worked out for a 130 mg coffee to a drink of `mg`: a drink k times
 * stronger needs h·log2(k) more hours to decay to the same amount by bedtime.
 * Never later than bedtime; null when it would fall before midnight.
 */
export function cutoffForDrink(cutoff: string | null, h: number, mg: number, bedtime: string): string | null {
  if (!cutoff) return null;
  const mins = (t: string) => { const [hh, mm] = t.split(":").map(Number); return hh * 60 + mm; };
  const moved = Math.min(mins(cutoff) - Math.round(h * Math.log2(mg / 130) * 60), mins(bedtime));
  if (moved < 0) return null;
  return `${String(Math.floor(moved / 60)).padStart(2, "0")}:${String(moved % 60).padStart(2, "0")}`;
}

export function fixtureState(
  now = new Date(), drinks = fixtureDrinksToday(now), userId = 1,
  drink?: Pick<Preset, "mg" | "label">, bedtime = "23:30",
): StateResponse {
  const p = MOCK_PROFILES[userId] ?? MOCK_PROFILES[1];
  const curve = buildCurve(drinks, now, p.h);
  const total = drinks.reduce((s, d) => s + d.mg, 0);
  const cutoff = drink ? cutoffForDrink(p.cutoff, p.h, drink.mg, bedtime) : p.cutoff;
  return {
    now_mg: curve[0].mg,
    bedtime,
    cutoff,
    headline: cutoff ? `Last ${drink?.label ?? "coffee"} today by ${cutoff}` : "No more caffeine today",
    led: total >= 400 ? "red" : p.led,
    daily_total_mg: total,
    cap_mg: 400,
    curve,
    safe_line_mg: 38,
    is_simulated: userId !== 1,
  };
}

export function fixtureWhatIf(drink_key: string, mg: number, now = new Date()): WhatIfResponse {
  const drinks = [
    ...fixtureDrinksToday(now),
    { time: isoLocal(now), user_id: 1, drink_key, mg, mg_low: mg * 0.7, mg_high: mg * 1.3, source: "preset" as const },
  ];
  const median = Math.round(mg / 16);
  return {
    extra_latency_min: { median, low: Math.max(1, Math.round(median * 0.45)), high: Math.round(median * 1.9) },
    curve: buildCurve(drinks, now),
    led_after: mg >= 100 ? "red" : "amber",
    cap_exceeded: drinks.reduce((s, d) => s + d.mg, 0) > 400,
  };
}

const NIGHTS = 21;

export function fixtureSleep(now = new Date()): SleepNight[] {
  const lat = [18, 25, 14, 31, 22, 12, 35, 20, 17, 28, 15, 33, 19, 24, 13, 29, 21, 16, 34, 23, 26];
  return Array.from({ length: NIGHTS }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (NIGHTS + 1 - i)); // ends the night before last: last night is pending
    d.setHours(23, 30, 0, 0);
    return {
      night: dateOnly(d), user_id: 1, bedtime: isoLocal(d),
      latency_min: lat[i], rested_1to5: ((i * 7) % 4) + 2,
    };
  });
}

/** Mock users: 1 is "you"; 2 and 3 are the simulated demo pair (same habits, different true h). */
export const MOCK_PROFILES: Record<number, { h: number; sd: number; beta: number; label: string; cutoff: string | null; led: "green" | "amber" | "red" }> = {
  1: { h: HALF_LIFE_H, sd: 1.0, beta: 6.2, label: "Average sensitivity", cutoff: "14:10", led: "amber" },
  2: { h: 9.0, sd: 0.9, beta: 7.0, label: "Above-average sensitivity", cutoff: "11:40", led: "red" },
  3: { h: 3.5, sd: 0.5, beta: 5.1, label: "Average sensitivity", cutoff: "18:20", led: "green" },
};
const POP_H = 5;

export function fixtureProfile(now = new Date(), userId = 1): ProfileResponse {
  const p = MOCK_PROFILES[userId] ?? MOCK_PROFILES[1];
  const grid: number[] = [];
  const prob: number[] = [];
  for (let i = 0; i < 200; i++) {
    const h = 1.5 * Math.pow(15 / 1.5, i / 199);
    grid.push(Number(h.toFixed(3)));
    // log-normal-ish around the mean, matching the log-h prior
    prob.push(Math.exp(-0.5 * ((Math.log(h) - Math.log(p.h)) / (p.sd / p.h)) ** 2) / h);
  }
  const z = prob.reduce((a, b) => a + b, 0);
  const checkins = fixtureSleep(now).map((c) => ({ ...c, user_id: userId }));
  return {
    half_life: { mean: p.h, sd: p.sd, ci80: [Number((p.h - 1.28 * p.sd).toFixed(1)), Number((p.h + 1.28 * p.sd).toFixed(1))] },
    population_mean_h: POP_H,
    sensitivity: { mean: p.beta, sd: 2.1, label: p.label },
    posterior: { h_grid: grid, prob: prob.map((x) => x / z) },
    history: checkins.map((c, i) => {
      // Starts at the population prior and converges on the user's value; the band narrows.
      const k = 1 - Math.exp(-(i + 1) / 6);
      const mean = POP_H + (p.h - POP_H) * k;
      const half = 1.28 * (3.4 * (1 - k) + p.sd * k);
      return {
        night: c.night,
        h_mean: Number(mean.toFixed(2)),
        h_low: Number(Math.max(1.5, mean - half).toFixed(2)),
        h_high: Number((mean + half).toFixed(2)),
      };
    }),
    checkins,
  };
}

export function fixtureIdentify(kind: "photo" | "text" = "photo"): IdentifyResponse {
  return {
    gemini: { drink: "milk_coffee", size: "regular", shots: 2, brand: "Pret", decaf: false, label_mg: null, confidence: kind === "photo" ? 0.82 : 0.9,
      analysis: {
        verdict: "Pret regular oat flat white", description: "A white paper takeaway cup with a burgundy Pret sleeve and a domed lid, held in one hand.",
        category: "coffee", product_name: "Flat white", container: "paper_cup", volume_ml: 340, volume_source: "estimated",
        temperature: "hot", milk: "oat", additions: [], visible_text: ["PRET A MANGER", "OAT"], printed_caffeine: null,
        evidence: ["Pret logo on the sleeve", "'OAT' marked on the lid", "Cup about the height of the hand holding it"],
        alternatives: [{ drink: "americano", confidence: 0.08 }], image_issues: [],
      } },
    estimate: { drink_key: "milk_coffee", label: "Latte (regular)", mg: 130, mg_low: 90, mg_high: 180, needs: ["decaf"], auto_accept: false },
  };
}

export const fixtureAlcohol = (units: number, now = new Date()): Alcohol => ({ time: isoLocal(now), user_id: 1, units });

export const fixtureHr = (hr_bpm: number, br_bpm: number, drink_time: string | null): HrCheck =>
  ({ time: isoLocal(new Date()), user_id: 1, drink_time, hr_bpm, br_bpm });

/** Mock desk-machine activity: one held-up drink, returned on the first read only. */
export function fixtureMachineLog(after = 0, now = new Date()): MachineLog {
  const lines: [number, MachineLog["entries"][number]["kind"], string][] = [
    [40, "info", "detector ready: yolo26n.engine + ByteTrack; hold a drink up to the camera"],
    [12, "track", "#3 cup appeared (0.81)"],
    [11, "trigger", "#3 cup held up, asking Gemini..."],
    [9, "logged", "logged Starbucks grande oat latte: 150 mg"],
    [2, "lost", "#3 cup left"],
  ];
  const entries = lines.map(([s, kind, message], i) => ({
    seq: i + 1, time: new Date(now.getTime() - s * 1000).toISOString(), kind, message,
  }));
  return { entries: entries.filter((e) => e.seq > after), last: entries.length };
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import BedtimeGoal from "@/components/BedtimeGoal";
import CaffeineCurve from "@/components/CaffeineCurve";
import DailyCapBar from "@/components/DailyCapBar";
import TodayHeadline from "@/components/TodayHeadline";
import CutoffCountdown, { cutoffDeadline } from "@/components/CutoffCountdown";
import { ApiError, getPresets, getState, getUser, storedUserId, useApi, useUserId } from "@/lib/api";

const DRINK_KEY = "cutoff_drink";

export default function Today() {
  const router = useRouter();
  const userId = useUserId();
  const profile = useApi(userId ? `/users/${userId}` : null, () => getUser(userId!));
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = setInterval(update, 1000);
    window.addEventListener("focus", update);
    return () => { clearInterval(timer); window.removeEventListener("focus", update); };
  }, []);
  useEffect(() => { if (storedUserId() === null) router.replace("/login"); }, [router]);
  // Which drink the cutoff is for; remembered on this device. "" is a standard coffee.
  const [drinkKey, setDrinkKey] = useState("");
  useEffect(() => { try { setDrinkKey(localStorage.getItem(DRINK_KEY) ?? ""); } catch { /* storage unavailable */ } }, []);
  const chooseDrink = (key: string) => {
    setDrinkKey(key);
    try { localStorage.setItem(DRINK_KEY, key); } catch { /* storage unavailable */ }
  };
  const presets = useApi("/presets", getPresets);
  const drinks = useMemo(() => presets.data?.filter((p) => p.mg >= 10), [presets.data]);
  const drink = drinks?.find((p) => p.key === drinkKey);
  const { data: fresh, error } = useApi(userId ? `/state?user_id=${userId}&drink=${drink?.key ?? ""}` : null,
    () => getState(userId!, drink));
  // Keep showing the last result while a newly chosen drink loads, instead of blanking the page.
  const last = useRef(fresh);
  if (fresh) last.current = fresh;
  const s = fresh ?? last.current;
  const deadline = useMemo(() => cutoffDeadline(s?.cutoff ?? null, new Date()), [s]);

  if (error && !s) {
    // 503: the backend is up but the M2–M7 model isn't built; set NEXT_PUBLIC_MOCK_MODEL=1 (see README).
    const message = error instanceof ApiError
      ? error.status === 503 ? "Today's numbers need the caffeine model, which isn't built yet."
        : `The server couldn't load today (error ${error.status}).`
      : "Couldn't reach the server.";
    return <p style={{ color: "var(--muted)" }}>{message}</p>;
  }
  if (!s) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

  const hour = now?.getHours();
  const greeting = hour === undefined ? "Hello" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = profile.data?.name.trim().split(/\s+/)[0];
  const capped = s.daily_total_mg >= s.cap_mg;
  const expired = deadline !== null && now !== null && now.getTime() >= deadline;

  return (
    <div style={{ display: "grid", gap: 40 }}>
      <header>
        <p className="eyebrow" style={{ marginBottom: 8 }}>
          {now ? now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : "Today"}
        </p>
        <h1 style={{ fontSize: "clamp(1.6rem, 5vw, 2.25rem)", lineHeight: 1.15, margin: 0, overflowWrap: "anywhere" }}>
          {greeting}{name ? `, ${name}` : ""}
        </h1>
      </header>
      <section aria-label="Your caffeine cutoff">
        {capped || expired
          ? <TodayHeadline headline="No more caffeine today" cutoff={null} led="red" />
          : <TodayHeadline headline={s.headline} cutoff={s.cutoff} led={s.led}
              drinks={drinks} drinkKey={drink?.key ?? ""} onDrinkChange={chooseDrink} />}
        {!capped && deadline !== null && now !== null && <CutoffCountdown deadline={deadline} now={now.getTime()} />}
      </section>
      <CaffeineCurve curve={s.curve} bedtime={s.bedtime} safeLineMg={s.safe_line_mg} />
      <BedtimeGoal userId={userId!} bedtime={s.bedtime} />
      <DailyCapBar totalMg={s.daily_total_mg} capMg={s.cap_mg} />
    </div>
  );
}

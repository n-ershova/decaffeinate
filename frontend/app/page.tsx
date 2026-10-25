"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BedtimeGoal from "@/components/BedtimeGoal";
import CaffeineCurve from "@/components/CaffeineCurve";
import DailyCapBar from "@/components/DailyCapBar";
import TodayHeadline from "@/components/TodayHeadline";
import CutoffCountdown, { cutoffDeadline } from "@/components/CutoffCountdown";
import { getState, getUser, storedUserId, useApi, useUserId } from "@/lib/api";

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
  const { data: s, error } = useApi(userId ? `/state?user_id=${userId}` : null, () => getState(userId!));
  const deadline = useMemo(() => cutoffDeadline(s?.cutoff ?? null, new Date()), [s]);

  if (error) return <p style={{ color: "var(--muted)" }}>Couldn&apos;t reach the server.</p>;
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
          : <TodayHeadline headline={s.headline} cutoff={s.cutoff} led={s.led} />}
        {!capped && deadline !== null && now !== null && <CutoffCountdown deadline={deadline} now={now.getTime()} />}
      </section>
      <CaffeineCurve curve={s.curve} bedtime={s.bedtime} safeLineMg={s.safe_line_mg} />
      <BedtimeGoal userId={userId!} bedtime={s.bedtime} />
      <DailyCapBar totalMg={s.daily_total_mg} capMg={s.cap_mg} />
    </div>
  );
}

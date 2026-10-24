"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BedtimeGoal from "@/components/BedtimeGoal";
import CaffeineCurve from "@/components/CaffeineCurve";
import DailyCapBar from "@/components/DailyCapBar";
import TodayHeadline from "@/components/TodayHeadline";
import { getState, storedUserId, useApi, useUserId } from "@/lib/api";

/** True once "HH:MM" is behind the current time today (within the last 12 h, so a past-midnight cutoff isn't misread). */
function passed(hhmm: string, now = new Date()): boolean {
  const [h, m] = hhmm.split(":").map(Number);
  const diff = (now.getHours() * 60 + now.getMinutes() - (h * 60 + m) + 1440) % 1440;
  return diff > 0 && diff < 720;
}

export default function Today() {
  const router = useRouter();
  const userId = useUserId();
  useEffect(() => { if (storedUserId() === null) router.replace("/onboarding"); }, [router]);
  const { data: s, error } = useApi(userId ? `/state?user_id=${userId}` : null, () => getState(userId!));

  if (error) return <p style={{ color: "var(--muted)" }}>Couldn&apos;t reach the server.</p>;
  if (!s) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: 40 }}>
      {/* Never show a time once over the daily cap or past the cutoff: there's no coffee left to recommend. */}
      {s.cutoff && (s.daily_total_mg >= s.cap_mg || passed(s.cutoff))
        ? <TodayHeadline headline="No more caffeine today" cutoff={null} led="red" />
        : <TodayHeadline headline={s.headline} cutoff={s.cutoff} led={s.led} />}
      <CaffeineCurve curve={s.curve} bedtime={s.bedtime} safeLineMg={s.safe_line_mg} />
      <BedtimeGoal userId={userId!} bedtime={s.bedtime} />
      <DailyCapBar totalMg={s.daily_total_mg} capMg={s.cap_mg} />
    </div>
  );
}

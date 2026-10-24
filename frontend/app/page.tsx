"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CaffeineCurve from "@/components/CaffeineCurve";
import DailyCapBar from "@/components/DailyCapBar";
import TodayHeadline from "@/components/TodayHeadline";
import WhatIfPanel from "@/components/WhatIfPanel";
import { getState, storedUserId, useApi, useUserId } from "@/lib/api";

export default function Today() {
  const router = useRouter();
  const userId = useUserId();
  useEffect(() => { if (storedUserId() === null) router.replace("/onboarding"); }, [router]);
  const { data: s, error } = useApi(userId ? `/state?user_id=${userId}` : null, () => getState(userId!));

  if (error) return <p style={{ color: "var(--muted)" }}>Couldn&apos;t reach the server.</p>;
  if (!s) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: 40 }}>
      <TodayHeadline headline={s.headline} cutoff={s.cutoff} led={s.led} />
      <CaffeineCurve curve={s.curve} bedtime={s.bedtime} safeLineMg={s.safe_line_mg} />
      <DailyCapBar totalMg={s.daily_total_mg} capMg={s.cap_mg} />
      <WhatIfPanel userId={userId!} baseCurve={s.curve} bedtime={s.bedtime} safeLineMg={s.safe_line_mg} />
    </div>
  );
}

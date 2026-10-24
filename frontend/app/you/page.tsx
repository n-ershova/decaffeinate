"use client";

import Link from "next/link";
import CheckinHistory from "@/components/CheckinHistory";
import HalfLifeCard from "@/components/HalfLifeCard";
import PosteriorChart from "@/components/PosteriorChart";
import { getProfile, useApi, useUserId } from "@/lib/api";

export default function You() {
  const userId = useUserId();
  const { data: p, error } = useApi(userId ? `/profile?user_id=${userId}` : null, () => getProfile(userId!));

  if (error) return <p style={{ color: "var(--muted)" }}>Couldn&apos;t reach the server.</p>;
  if (!p) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: 56, maxWidth: 560 }}>
      <HalfLifeCard profile={p} />
      <PosteriorChart history={p.history} posterior={p.posterior} />
      <CheckinHistory checkins={p.checkins} />
      <Link href="/settings" style={{ color: "var(--muted)", fontSize: "0.9rem", textDecoration: "none" }}>Settings →</Link>
    </div>
  );
}

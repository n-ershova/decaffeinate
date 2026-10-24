"use client";

import HalfLifeCard from "@/components/HalfLifeCard";
import PosteriorChart from "@/components/PosteriorChart";
import { getProfile, useApi, useUserId } from "@/lib/api";

export default function You() {
  const userId = useUserId();
  const { data: p, error } = useApi(userId ? `/profile?user_id=${userId}` : null, () => getProfile(userId!));

  if (error) return <p style={{ color: "var(--muted)" }}>Couldn&apos;t reach the server.</p>;
  if (!p) return <p style={{ color: "var(--muted)" }}>Loading…</p>;

  return (
    <div style={{ maxWidth: 560 }}>
      <HalfLifeCard profile={p} />
      <PosteriorChart history={p.history} posterior={p.posterior} />
      <p style={{ margin: "8px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>Estimate, not medical advice.</p>
    </div>
  );
}

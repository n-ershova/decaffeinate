"use client";

import { useEffect, useState } from "react";
import CheckinHistory from "@/components/CheckinHistory";
import PosteriorChart from "@/components/PosteriorChart";
import { fixtureProfile } from "@/lib/fixtures";
import type { ProfileResponse } from "@/lib/types";

export default function Preview() {
  const [p, setP] = useState<ProfileResponse | null>(null);
  useEffect(() => setP(fixtureProfile()), []);
  return (
    <>
      <h1>PosteriorChart + CheckinHistory</h1>
      {p && (
        <div style={{ maxWidth: 560, display: "grid", gap: 48, marginTop: 32 }}>
          <PosteriorChart history={p.history} posterior={p.posterior} />
          <CheckinHistory checkins={p.checkins} />
        </div>
      )}
    </>
  );
}

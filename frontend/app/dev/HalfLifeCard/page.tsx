"use client";

import { useEffect, useState } from "react";
import HalfLifeCard from "@/components/HalfLifeCard";
import { fixtureProfile } from "@/lib/fixtures";
import type { ProfileResponse } from "@/lib/types";

export default function Preview() {
  const [p, setP] = useState<ProfileResponse[] | null>(null);
  useEffect(() => setP([fixtureProfile(new Date(), 1), fixtureProfile(new Date(), 3)]), []);
  return (
    <>
      <h1>HalfLifeCard</h1>
      <div style={{ display: "grid", gap: 56, maxWidth: 440, marginTop: 32 }}>
        {p?.map((x, i) => <HalfLifeCard key={i} profile={x} />)}
      </div>
    </>
  );
}

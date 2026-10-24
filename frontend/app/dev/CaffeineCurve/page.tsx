"use client";

import { useEffect, useState } from "react";
import CaffeineCurve from "@/components/CaffeineCurve";
import { fixtureState, fixtureWhatIf } from "@/lib/fixtures";
import type { StateResponse, WhatIfResponse } from "@/lib/types";

const label = { color: "var(--muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "40px 0 12px" };

export default function Preview() {
  // Built after mount: fixtures depend on the current time, which differs between server and client.
  const [fx, setFx] = useState<{ s: StateResponse; w: WhatIfResponse } | null>(null);
  useEffect(() => setFx({ s: fixtureState(), w: fixtureWhatIf("energy_drink_500", 160) }), []);

  return (
    <>
      <h1>CaffeineCurve</h1>
      {fx && (
        <>
          <h3 style={label}>Normal</h3>
          <CaffeineCurve curve={fx.s.curve} bedtime={fx.s.bedtime} safeLineMg={fx.s.safe_line_mg} />
          <h3 style={label}>What-if: energy drink now</h3>
          <CaffeineCurve curve={fx.s.curve} bedtime={fx.s.bedtime} safeLineMg={fx.s.safe_line_mg} compareCurve={fx.w.curve} />
        </>
      )}
    </>
  );
}

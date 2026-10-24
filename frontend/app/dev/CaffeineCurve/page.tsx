"use client";

import { useEffect, useState } from "react";
import CaffeineCurve from "@/components/CaffeineCurve";
import { fixtureState, fixtureWhatIf } from "@/lib/fixtures";
import type { StateResponse, WhatIfResponse } from "@/lib/types";

export default function Preview() {
  // Built after mount: fixtures depend on the current time, which differs between server and client.
  const [fx, setFx] = useState<{ s: StateResponse; w: WhatIfResponse } | null>(null);
  useEffect(() => setFx({ s: fixtureState(), w: fixtureWhatIf("energy_drink_500", 160) }), []);

  return (
    <>
      <h1>CaffeineCurve preview</h1>
      {fx && (
        <>
          <h3>Normal</h3>
          <CaffeineCurve curve={fx.s.curve} bedtime={fx.s.bedtime} safeLineMg={fx.s.safe_line_mg} />
          <h3>Compare (what-if: energy drink now)</h3>
          <CaffeineCurve curve={fx.s.curve} bedtime={fx.s.bedtime} safeLineMg={fx.s.safe_line_mg} compareCurve={fx.w.curve} />
        </>
      )}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import WhatIfPanel from "@/components/WhatIfPanel";
import { fixtureState } from "@/lib/fixtures";
import type { StateResponse } from "@/lib/types";

export default function Preview() {
  // Built after mount: fixtures depend on the current time, which differs between server and client.
  const [s, setS] = useState<StateResponse | null>(null);
  useEffect(() => setS(fixtureState()), []);

  return (
    <>
      <h1>WhatIfPanel</h1>
      <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginBottom: 32 }}>
        Calls <code>/whatif</code> through <code>lib/api</code>; run with <code>NEXT_PUBLIC_MOCK=1</code> to use fixtures.
      </p>
      {s && <WhatIfPanel userId={1} baseCurve={s.curve} bedtime={s.bedtime} safeLineMg={s.safe_line_mg} />}
    </>
  );
}

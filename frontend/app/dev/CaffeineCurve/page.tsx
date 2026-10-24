"use client";

import CaffeineCurve from "@/components/CaffeineCurve";
import { fixtureState, fixtureWhatIf } from "@/lib/fixtures";

export default function Preview() {
  const s = fixtureState();
  const w = fixtureWhatIf("energy_drink_500", 160);
  return (
    <>
      <h1>CaffeineCurve preview</h1>
      <h3>Normal</h3>
      <CaffeineCurve curve={s.curve} bedtime={s.bedtime} safeLineMg={s.safe_line_mg} />
      <h3>Compare (what-if: energy drink now)</h3>
      <CaffeineCurve curve={s.curve} bedtime={s.bedtime} safeLineMg={s.safe_line_mg} compareCurve={w.curve} />
    </>
  );
}

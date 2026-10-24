"use client";

import { useState } from "react";
import OnboardingFlow from "@/components/OnboardingFlow";
import type { User } from "@/lib/types";

export default function Preview() {
  const [user, setUser] = useState<User | null>(null);
  const [run, setRun] = useState(0);
  return (
    <>
      <h1 style={{ marginBottom: 40 }}>OnboardingFlow</h1>
      {user ? (
        <>
          <pre style={{ fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "pre-wrap" }}>
            {`onDone(${JSON.stringify(user, null, 2)})\nlocalStorage.user_id = ${localStorage.getItem("user_id")}`}
          </pre>
          <button className="link" onClick={() => { setUser(null); setRun(run + 1); }}>Restart</button>
        </>
      ) : (
        <OnboardingFlow key={run} onDone={setUser} />
      )}
    </>
  );
}

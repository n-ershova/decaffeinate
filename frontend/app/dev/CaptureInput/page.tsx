"use client";

import { useState } from "react";
import CaptureInput from "@/components/CaptureInput";
import type { IdentifyResponse } from "@/lib/types";

export default function Preview() {
  const [result, setResult] = useState<IdentifyResponse | null>(null);
  return (
    <>
      <h1>CaptureInput</h1>
      <div style={{ maxWidth: 480 }}>
        <CaptureInput onResult={setResult} />
        <pre style={{ marginTop: 32, fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "pre-wrap" }}>
          {result ? JSON.stringify(result, null, 2) : "No result yet."}
        </pre>
      </div>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import OnboardingFlow from "@/components/OnboardingFlow";

export default function Onboarding() {
  const router = useRouter();
  return (
    <div style={{ minHeight: "80dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <p className="wordmark" style={{ margin: "0 0 64px" }}><span className="wordmark-mark" aria-hidden />Decaffeinate</p>
        <OnboardingFlow onDone={() => router.replace("/")} />
      </div>
    </div>
  );
}

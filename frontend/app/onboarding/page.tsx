"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Onboarding() {
  const router = useRouter();
  useEffect(() => { router.replace("/login"); }, [router]);
  return <p role="status">Opening sign-in…</p>;
}

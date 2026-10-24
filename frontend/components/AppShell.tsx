"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import MorningCheckin from "@/components/MorningCheckin";
import { getSleepPending, useApi, useUserId } from "@/lib/api";

const TABS = [
  { href: "/", label: "Today" },
  { href: "/log", label: "Log" },
  { href: "/you", label: "You" },
];

const LONG_PRESS_MS = 700;

const SKIP_KEY = "checkin_skipped";
const skipped = (night: string) => { try { return localStorage.getItem(SKIP_KEY) === night; } catch { return false; } };

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hidden demo toggle: hold the wordmark.
  const press = () => { timer.current = setTimeout(() => router.push("/demo"), LONG_PRESS_MS); };
  const release = () => { if (timer.current) clearTimeout(timer.current); };

  // Morning check-in: shown once per night on real screens, until saved or skipped.
  const bare = path.startsWith("/onboarding") || path.startsWith("/dev");
  const userId = useUserId();
  const pending = useApi(userId && !bare ? `/sleep/pending?user_id=${userId}` : null, () => getSleepPending(userId!));
  const [dismissed, setDismissed] = useState<string | null>(null);
  const night = pending.data?.night;
  const showCheckin = !!pending.data?.needs_checkin && night !== dismissed && !skipped(night!);
  const closeCheckin = () => {
    try { localStorage.setItem(SKIP_KEY, night!); } catch { /* storage unavailable */ }
    setDismissed(night!);
    pending.mutate();
  };

  if (path.startsWith("/onboarding")) return <main className="main">{children}</main>;

  return (
    <div className="shell">
      <header className="top">
        <div
          className="wordmark"
          onPointerDown={press} onPointerUp={release} onPointerLeave={release} onPointerCancel={release}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="wordmark-mark" aria-hidden />
          Decaffeinate
        </div>
        <nav className="tabs" aria-label="Main">
          {TABS.map((t) => {
            const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} className={`tab${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="main">{children}</main>
      {showCheckin && userId && <MorningCheckin userId={userId} night={night!} onDone={closeCheckin} />}
    </div>
  );
}

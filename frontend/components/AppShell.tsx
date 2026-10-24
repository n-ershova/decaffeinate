"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import MorningCheckin from "@/components/MorningCheckin";
import { getSleepPending, useApi, useUserId } from "@/lib/api";

const TABS = [
  { href: "/", label: "Today", icon: "M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12Zm9-5v5l3 2" },
  { href: "/log", label: "Log", icon: "M12 5v14M5 12h14" },
  { href: "/you", label: "You", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" },
];

const SKIP_KEY = "checkin_skipped";
const skipped = (night: string) => { try { return localStorage.getItem(SKIP_KEY) === night; } catch { return false; } };

const LONG_PRESS_MS = 700;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hidden demo toggle: hold the logo.
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
      <aside className="nav">
        <div
          className="logo"
          onPointerDown={press} onPointerUp={release} onPointerLeave={release} onPointerCancel={release}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="logo-mark" aria-hidden />
          <span className="logo-text">HalfLife</span>
        </div>
        <nav>
          {TABS.map((t) => {
            const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} className={`tab${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
                <span>{t.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="main">{children}</main>
      {showCheckin && userId && <MorningCheckin userId={userId} night={night!} onDone={closeCheckin} />}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { sessionUser } from "@/lib/auth";
import { clearApiCache, setStoredUserId } from "@/lib/api";

// Reachable without a session: signing in or up, and setting a new password from an emailed link.
const PUBLIC = ["/login", "/reset"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const user = await sessionUser();
        if (!active) return;
        setError(false);
        setUserId((previous) => {
          if (previous !== (user?.id ?? null)) clearApiCache();
          return user?.id ?? null;
        });
        setStoredUserId(user?.id ?? null);
        setChecked(true);
        if (!user && !PUBLIC.includes(path)) router.replace("/login");
        if (user && path === "/login") router.replace("/");
      } catch { if (active) setError(true); }
    }
    const expired = () => {
      clearApiCache(); setStoredUserId(null); setUserId(null); router.replace("/login");
    };
    const storage = (event: StorageEvent) => { if (event.key === "user_id") { setChecked(false); check(); } };
    check();
    window.addEventListener("focus", check);
    window.addEventListener("session-expired", expired);
    window.addEventListener("storage", storage);
    return () => {
      active = false;
      window.removeEventListener("focus", check);
      window.removeEventListener("session-expired", expired);
      window.removeEventListener("storage", storage);
    };
  }, [path, router]);

  if (error) return <main className="main"><p role="alert">Could not connect to the server.</p><button className="btn" onClick={() => window.location.reload()}>Try again</button></main>;
  if (PUBLIC.includes(path) && !userId) return children;
  if (!checked || !userId) return <main className="main"><p role="status">Checking your session…</p></main>;
  return <div key={userId}>{children}</div>;
}

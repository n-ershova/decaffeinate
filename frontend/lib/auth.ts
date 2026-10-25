"use client";

import { clearApiCache, setStoredUserId } from "./api";
import type { User } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function sessionUser(): Promise<User | null> {
  const res = await fetch(`${BASE}/auth/me`, { credentials: "include", cache: "no-store" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Could not check your session. Please try again.");
  return res.json();
}

export async function signIn(mode: "login" | "register", body: Record<string, unknown>): Promise<User> {
  const res = await fetch(`${BASE}/auth/${mode}`, {
    method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(typeof data?.detail === "string" ? data.detail : "Check your details and try again.");
  }
  const user: User = await res.json();
  clearApiCache();
  setStoredUserId(user.id);
  return user;
}

export async function signOut(): Promise<void> {
  const res = await fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "include" });
  if (!res.ok) throw new Error("Could not sign out. Please try again.");
  clearApiCache();
  setStoredUserId(null);
  localStorage.removeItem("checkin_skipped");
  window.location.assign("/login");
}

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

/**
 * The reason a request failed, for showing to the user. FastAPI sends a string, or for
 * invalid fields a list like [{loc: ["body", "password"], msg: "String should have…"}].
 */
export function errorMessage(data: unknown, fallback: string): string {
  const detail = (data as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail.map((d: { loc?: unknown[]; msg?: string }) => {
      const field = String(d.loc?.[d.loc.length - 1] ?? "").replace(/_/g, " ");
      const msg = (d.msg ?? "is invalid").replace(/^Value error, /, "");
      return field && field !== "body" ? `${field[0].toUpperCase()}${field.slice(1)}: ${msg}` : msg;
    }).join(". ");
  }
  return fallback;
}

export async function signIn(mode: "login" | "register", body: Record<string, unknown>): Promise<User> {
  const res = await post(`/auth/${mode}`, body, "Check your details and try again.");
  const user: User = await res.json();
  clearApiCache();
  setStoredUserId(user.id);
  return user;
}

async function post(path: string, body: unknown, fallback: string): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
  } catch {
    // Backend not running, wrong NEXT_PUBLIC_API_URL, or this page's origin blocked by CORS.
    throw new Error(`Can't reach the server at ${BASE}. Check the backend is running.`);
  }
  if (!res.ok) throw new Error(errorMessage(await res.json().catch(() => null), fallback));
  return res;
}

/** Emails a reset link if the account exists; the response is the same either way. */
export async function requestPasswordReset(email: string): Promise<void> {
  await post("/auth/forgot", { email }, "Could not send the reset link. Try again.");
}

/** Sets a new password from a reset link and signs in. */
export async function resetPassword(token: string, password: string): Promise<User> {
  const res = await post("/auth/reset", { token, password }, "Could not reset your password. Try again.");
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

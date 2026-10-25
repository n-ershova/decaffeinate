"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MOCK_USER, PRESETS, fixtureAlcohol, fixtureDrinkHistory, fixtureHr, fixtureIdentify,
  fixtureProfile, fixtureSleep, fixtureState, fixtureWhatIf, isoLocal,
} from "./fixtures";
import type {
  Alcohol, CurvePoint, DemoSeedResponse, Drink, HrCheck, IdentifyResponse, MachineStatus, Preset, ProfileResponse,
  SleepNight, Source, StateResponse, User, WhatIfResponse,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const MOCK = process.env.NEXT_PUBLIC_MOCK === "1";
// Lets photo/text recognition hit the real backend while everything else stays mocked.
const LIVE_IDENTIFY = process.env.NEXT_PUBLIC_LIVE_IDENTIFY === "1";
// Mocks only what needs the M2–M7 model (/state, /profile, /whatif, /brief), built from real logs.
// The Today curve itself is real: GET /curve needs only M1.
const MOCK_MODEL = process.env.NEXT_PUBLIC_MOCK_MODEL === "1";
const MOCK_DELAY_MS = 300;

const mock = <T,>(make: () => T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(make()), MOCK_DELAY_MS));

// In-memory store so writes show up in later reads while in mock mode.
const store = {
  drinks: null as Drink[] | null,
  sleep: null as SleepNight[] | null,
  user: { ...MOCK_USER },
};
const mockDrinks = () => (store.drinks ??= fixtureDrinkHistory());
const mockSleep = () => (store.sleep ??= fixtureSleep());
const sameDay = (iso: string, now: Date) => new Date(iso).toDateString() === now.toDateString();

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Fired when the backend no longer knows the stored user (the in-memory repo forgets on restart). */
export const UNKNOWN_USER_EVENT = "unknown-user";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, credentials: "include", cache: "no-store" });
  if (res.status === 401) window.dispatchEvent(new Event("session-expired"));
  if (res.status === 404) {
    const body = await res.clone().json().catch(() => null);
    if (body?.detail === "Unknown user") window.dispatchEvent(new Event(UNKNOWN_USER_EVENT));
  }
  if (!res.ok) throw new ApiError(`${init?.method ?? "GET"} ${path} failed: ${res.status}`, res.status);
  return res.json() as Promise<T>;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const qs = (params: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) p.set(k, String(v));
  return `?${p}`;
};

// ---- Reads ----

/** `drink` sets which drink the cutoff is for; without it, a standard 130 mg coffee. */
export function getState(userId = 1, drink?: Preset): Promise<StateResponse> {
  if (MOCK) {
    return mock(() => {
      const now = new Date();
      const today = mockDrinks().filter((d) => sameDay(d.time, now));
      return fixtureState(now, today, userId, drink, store.user.bedtime.slice(0, 5));
    });
  }
  if (MOCK_MODEL) {
    return Promise.all([getDrinks(userId, 1), getUser(userId), getCurve(userId)]).then(([drinks, user, c]) => {
      const now = new Date();
      const s = fixtureState(now, drinks.filter((d) => sameDay(d.time, now)), userId, drink, user.bedtime.slice(0, 5));
      return { ...s, now_mg: c.now_mg, curve: c.curve };
    });
  }
  return http(`/state${qs({ user_id: userId, drink_key: drink?.key })}`);
}

/** Caffeine in the body from now to 08:00, at the population half-life (M1 only). */
export function getCurve(userId = 1): Promise<{ now_mg: number; h: number; curve: CurvePoint[] }> {
  if (MOCK) {
    return mock(() => {
      const now = new Date();
      const curve = fixtureState(now, mockDrinks().filter((d) => sameDay(d.time, now)), userId).curve;
      return { now_mg: curve[0].mg, h: 5, curve };
    });
  }
  return http(`/curve${qs({ user_id: userId })}`);
}

export function getProfile(userId = 1): Promise<ProfileResponse> {
  if (MOCK) {
    return mock(() => {
      const p = fixtureProfile(new Date(), userId);
      return userId === 1 ? { ...p, checkins: mockSleep() } : p;
    });
  }
  if (MOCK_MODEL) return getSleep(userId).then((checkins) => ({ ...fixtureProfile(new Date(), userId), checkins }));
  return http(`/profile${qs({ user_id: userId })}`);
}

export function getSleep(userId = 1): Promise<SleepNight[]> {
  if (MOCK) return mock(() => [...mockSleep()].sort((a, b) => b.night.localeCompare(a.night)));
  return http(`/sleep${qs({ user_id: userId })}`);
}

export function getDrinks(userId = 1, days = 14): Promise<Drink[]> {
  if (MOCK) return mock(() => mockDrinks().filter((d) => Date.now() - new Date(d.time).getTime() < days * 864e5));
  return http(`/drinks${qs({ user_id: userId, days })}`);
}

export function getPresets(): Promise<Preset[]> {
  if (MOCK) return mock(() => PRESETS);
  return http("/presets");
}

export function getSleepPending(userId = 1): Promise<{ needs_checkin: boolean; night: string }> {
  if (MOCK) {
    return mock(() => {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const night = isoLocal(y).slice(0, 10);
      return { needs_checkin: !mockSleep().some((s) => s.night === night), night };
    });
  }
  return http(`/sleep/pending${qs({ user_id: userId })}`);
}

export function getUser(id = 1): Promise<User> {
  if (MOCK) return mock(() => ({ ...store.user, id }));
  return http(`/users/${id}`);
}

/** Whether the desk machine has sent a heartbeat recently. */
export function getMachine(): Promise<MachineStatus> {
  if (MOCK) return mock(() => ({ online: true, last_seen: new Date().toISOString(), seconds_ago: 1 }));
  return http("/machine");
}

/** Returns an object URL for the morning-brief audio. */
export async function getBrief(userId = 1): Promise<string> {
  if (MOCK || MOCK_MODEL) return "";
  const res = await fetch(`${BASE}/brief${qs({ user_id: userId })}`, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error(`GET /brief failed: ${res.status}`);
  return URL.createObjectURL(await res.blob());
}

// ---- Writes (each revalidates /state, see below) ----

export function whatIf(userId: number, drinkKey: string, mg: number): Promise<WhatIfResponse> {
  if (MOCK || MOCK_MODEL) return mock(() => fixtureWhatIf(drinkKey, mg));
  return http("/whatif", json("POST", { user_id: userId, drink_key: drinkKey, mg }));
}

export async function identifyDrink(
  input: { image?: Blob; text?: string; source: Source; user_id?: number },
): Promise<IdentifyResponse> {
  if (MOCK && !LIVE_IDENTIFY) return mock(() => fixtureIdentify(input.image ? "photo" : "text"));
  const form = new FormData();
  if (input.image) form.append("image", input.image, "drink.jpg");
  if (input.text) form.append("text", input.text);
  form.append("source", input.source);
  form.append("user_id", String(input.user_id ?? storedUserId() ?? 1));
  const out = await http<IdentifyResponse>("/drinks/identify", { method: "POST", body: form });
  // The backend logged it; mirror that into the mock store so reads stay consistent.
  if (MOCK && out.logged) mockDrinks().push(out.logged);
  if (out.logged) revalidateDrinks();
  return out;
}

export type NewDrink = Omit<Drink, "time" | "user_id"> & { user_id?: number; time?: string };

export async function logDrink(d: NewDrink): Promise<Drink> {
  const drink: Drink = { user_id: 1, time: isoLocal(new Date()), ...d };
  const out = MOCK
    ? await mock(() => (mockDrinks().push(drink), drink))
    : await http<Drink>("/drinks", json("POST", d));
  revalidateDrinks();
  return out;
}

function revalidateDrinks() {
  revalidate("/drinks");
  revalidate("/curve");
  revalidate("/state");
}

/** Deletes the given user's drinks, identified by their `time`. */
export async function deleteDrinks(userId: number, times: string[]): Promise<void> {
  const drop = new Set(times);
  if (MOCK) await mock(() => { store.drinks = mockDrinks().filter((d) => !drop.has(d.time)); });
  else await http("/drinks", json("DELETE", { user_id: userId, times }));
  revalidate("/drinks");
  revalidate("/state");
}

/** Deletes the given user's morning check-ins, identified by `night`. */
export async function deleteSleep(userId: number, nights: string[]): Promise<void> {
  const drop = new Set(nights);
  if (MOCK) await mock(() => { store.sleep = mockSleep().filter((n) => !drop.has(n.night)); });
  else await http("/sleep", json("DELETE", { user_id: userId, nights }));
  revalidate("/profile");
  revalidate("/sleep");
  revalidate("/state");
}

export async function logAlcohol(units: number, userId = 1): Promise<Alcohol> {
  const out = MOCK
    ? await mock(() => fixtureAlcohol(units))
    : await http<Alcohol>("/alcohol", json("POST", { user_id: userId, units }));
  revalidate("/state");
  return out;
}

export async function submitSleep(s: Omit<SleepNight, "user_id"> & { user_id?: number }): Promise<SleepNight> {
  const night: SleepNight = { user_id: 1, ...s };
  const out = MOCK
    ? await mock(() => {
        store.sleep = [...mockSleep().filter((n) => n.night !== night.night), night];
        return night;
      })
    : await http<SleepNight>("/sleep", json("POST", s));
  revalidate("/state");
  revalidate("/profile");
  revalidate("/sleep");
  return out;
}

export async function createUser(u: Pick<User, "name" | "bedtime" | "smoker" | "hormonal_bc">): Promise<User> {
  const out = MOCK
    ? await mock(() => (store.user = { ...MOCK_USER, ...u }))
    : await http<User>("/users", json("POST", u));
  revalidate("/state");
  return out;
}

export async function updateUser(id: number, patch: Partial<Pick<User, "bedtime" | "tolerance_min" | "smoker" | "hormonal_bc">>): Promise<User> {
  const out = MOCK
    ? await mock(() => (store.user = { ...store.user, ...patch }))
    : await http<User>(`/users/${id}`, json("PATCH", patch));
  revalidate("/state");
  return out;
}

export async function seedDemo(): Promise<DemoSeedResponse> {
  const out = MOCK
    ? await mock(() => ({ users: [{ id: 2, name: "Sam", true_h: 9 }, { id: 3, name: "Jo", true_h: 3.5 }] }))
    : await http<DemoSeedResponse>("/demo/seed", { method: "POST" });
  revalidate("/state");
  return out;
}

export function postHr(userId: number, drinkTime: string | null, hr: number, br: number): Promise<HrCheck> {
  if (MOCK) return mock(() => fixtureHr(hr, br, drinkTime));
  return http("/hr", json("POST", { user_id: userId, drink_time: drinkTime, hr_bpm: hr, br_bpm: br }));
}

// ---- Current user ----

/** The signed-in user's id from localStorage (set by onboarding), or null before onboarding. */
export function storedUserId(): number | null {
  try {
    const v = localStorage.getItem("user_id");
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

const USER_EVENT = "user_id-change";

/** Saves (or with null, forgets) the current user and tells every `useUserId` on the page. */
export function setStoredUserId(id: number | null): void {
  try {
    if (id === null) localStorage.removeItem("user_id");
    else localStorage.setItem("user_id", String(id));
  } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(USER_EVENT));
}

/** Client-only: null on the server and first render, then the stored id (default 1). */
export function useUserId(): number | null {
  const [id, setId] = useState<number | null>(null);
  useEffect(() => {
    // Layout components outlive onboarding, so follow later changes too.
    const read = () => setId(storedUserId() ?? (MOCK ? 1 : null));
    read();
    window.addEventListener(USER_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(USER_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);
  return id;
}

// ---- useApi: SWR-style hook ----

type Entry = { data?: unknown; error?: unknown; inflight?: Promise<void> };
const cache = new Map<string, Entry>();
export function clearApiCache(): void { cache.clear(); }
const listeners = new Map<string, Set<() => void>>();
const refetchers = new Map<string, Set<() => unknown>>();

const notify = (key: string) => listeners.get(key)?.forEach((fn) => fn());

function load(key: string, fetcher: () => Promise<unknown>): Promise<void> {
  const entry = cache.get(key) ?? {};
  cache.set(key, entry);
  entry.inflight ??= fetcher()
    .then((data) => { entry.data = data; entry.error = undefined; })
    .catch((err) => { entry.error = err; })
    .finally(() => { entry.inflight = undefined; notify(key); });
  return entry.inflight;
}

/** Refetch every mounted key that starts with `prefix`. Called after any write. */
export function revalidate(prefix: string): void {
  for (const [key, subs] of refetchers) {
    if (key.startsWith(prefix)) subs.forEach((fn) => fn());
  }
}

/**
 * `useApi("/state?user=1", () => getState(1))`. Serves cached data immediately,
 * then refetches; refetches again whenever a write calls `revalidate(prefix)`.
 */
export function useApi<T>(key: string | null, fetcher: () => Promise<T>) {
  const [, rerender] = useState(0);
  const refetch = useCallback(() => {
    if (!key) return Promise.resolve();
    const entry = cache.get(key);
    if (entry) entry.inflight = undefined; // force a fresh request
    return load(key, fetcher);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!key) return;
    const bump = () => rerender((n) => n + 1);
    const subs = listeners.get(key) ?? new Set();
    subs.add(bump);
    listeners.set(key, subs);
    const rf = refetchers.get(key) ?? new Set();
    rf.add(refetch);
    refetchers.set(key, rf);
    refetch();
    return () => { subs.delete(bump); rf.delete(refetch); };
  }, [key, refetch]);

  const entry = key ? cache.get(key) : undefined;
  return {
    data: entry?.data as T | undefined,
    error: entry?.error as Error | undefined,
    isLoading: !!key && entry?.data === undefined && entry?.error === undefined,
    mutate: refetch,
  };
}

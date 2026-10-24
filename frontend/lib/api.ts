"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MOCK_USER, PRESETS, fixtureAlcohol, fixtureDrinkHistory, fixtureHr, fixtureIdentify,
  fixtureProfile, fixtureSleep, fixtureState, fixtureWhatIf, isoLocal,
} from "./fixtures";
import type {
  Alcohol, DemoSeedResponse, Drink, HrCheck, IdentifyResponse, Preset, ProfileResponse,
  SleepNight, Source, StateResponse, User, WhatIfResponse,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const MOCK = process.env.NEXT_PUBLIC_MOCK === "1";
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

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status}`);
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

export function getState(userId = 1): Promise<StateResponse> {
  if (MOCK) {
    return mock(() => {
      const now = new Date();
      const today = mockDrinks().filter((d) => sameDay(d.time, now));
      const s = fixtureState(now, today);
      s.bedtime = store.user.bedtime;
      return s;
    });
  }
  return http(`/state${qs({ user_id: userId })}`);
}

export function getProfile(userId = 1): Promise<ProfileResponse> {
  if (MOCK) return mock(() => ({ ...fixtureProfile(), checkins: mockSleep() }));
  return http(`/profile${qs({ user_id: userId })}`);
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

/** Returns an object URL for the morning-brief audio. */
export async function getBrief(userId = 1): Promise<string> {
  if (MOCK) return "";
  const res = await fetch(`${BASE}/brief${qs({ user_id: userId })}`);
  if (!res.ok) throw new Error(`GET /brief failed: ${res.status}`);
  return URL.createObjectURL(await res.blob());
}

// ---- Writes (each revalidates /state, see below) ----

export function whatIf(userId: number, drinkKey: string, mg: number): Promise<WhatIfResponse> {
  if (MOCK) return mock(() => fixtureWhatIf(drinkKey, mg));
  return http("/whatif", json("POST", { user_id: userId, drink_key: drinkKey, mg }));
}

export function identifyDrink(
  input: { image?: Blob; text?: string; source: Source; user_id?: number },
): Promise<IdentifyResponse> {
  if (MOCK) return mock(() => fixtureIdentify(input.image ? "photo" : "text"));
  const form = new FormData();
  if (input.image) form.append("image", input.image, "drink.jpg");
  if (input.text) form.append("text", input.text);
  form.append("source", input.source);
  form.append("user_id", String(input.user_id ?? 1));
  return http("/drinks/identify", { method: "POST", body: form });
}

export type NewDrink = Omit<Drink, "time" | "user_id"> & { user_id?: number; time?: string };

export async function logDrink(d: NewDrink): Promise<Drink> {
  const drink: Drink = { user_id: 1, time: isoLocal(new Date()), ...d };
  const out = MOCK
    ? await mock(() => (mockDrinks().push(drink), drink))
    : await http<Drink>("/drinks", json("POST", d));
  revalidate("/state");
  return out;
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
  return out;
}

export async function createUser(u: Pick<User, "name" | "bedtime" | "smoker" | "hormonal_bc">): Promise<User> {
  const out = MOCK
    ? await mock(() => (store.user = { ...MOCK_USER, ...u }))
    : await http<User>("/users", json("POST", u));
  revalidate("/state");
  return out;
}

export async function updateUser(id: number, patch: Partial<Pick<User, "bedtime" | "tolerance_min">>): Promise<User> {
  const out = MOCK
    ? await mock(() => (store.user = { ...store.user, ...patch }))
    : await http<User>(`/users/${id}`, json("PATCH", patch));
  revalidate("/state");
  return out;
}

export async function seedDemo(): Promise<DemoSeedResponse> {
  const out = MOCK
    ? await mock(() => ({ users: [{ id: 2, name: "Sam (slow)", true_h: 9 }, { id: 3, name: "Jo (fast)", true_h: 3.5 }] }))
    : await http<DemoSeedResponse>("/demo/seed", { method: "POST" });
  revalidate("/state");
  return out;
}

export function postHr(userId: number, drinkTime: string | null, hr: number, br: number): Promise<HrCheck> {
  if (MOCK) return mock(() => fixtureHr(hr, br, drinkTime));
  return http("/hr", json("POST", { user_id: userId, drink_time: drinkTime, hr_bpm: hr, br_bpm: br }));
}

// ---- useApi: SWR-style hook ----

type Entry = { data?: unknown; error?: unknown; inflight?: Promise<void> };
const cache = new Map<string, Entry>();
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

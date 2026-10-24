// Mirrors 00-CONTRACTS.md 0.2 and 0.4 one-to-one. Owned by T00; minimal copy so F1 compiles.

export type Source = "preset" | "photo" | "text" | "jetson" | "simulated";
export type Led = "green" | "amber" | "red";

export interface User {
  id: number;
  name: string;
  bedtime: string; // "HH:MM"
  smoker: boolean;
  hormonal_bc: boolean;
  tolerance_min: number;
  is_simulated: boolean;
}

export interface Drink {
  time: string;
  user_id: number;
  drink_key: string;
  mg: number;
  mg_low: number;
  mg_high: number;
  source: Source;
}

export interface Alcohol {
  time: string;
  user_id: number;
  units: number;
}

export interface SleepNight {
  night: string;
  user_id: number;
  bedtime: string;
  latency_min: number;
  rested_1to5: number | null;
}

export interface HrCheck {
  time: string;
  user_id: number;
  drink_time: string | null;
  hr_bpm: number;
  br_bpm: number;
}

export interface GeminiResult {
  drink: string;
  size: "small" | "regular" | "large" | null;
  shots: number | null;
  brand: string | null;
  decaf: boolean;
  label_mg: number | null;
  confidence: number;
}

export interface DrinkEstimate {
  drink_key: string;
  label: string;
  mg: number;
  mg_low: number;
  mg_high: number;
  needs: ("shots" | "decaf" | "size")[];
  auto_accept: boolean;
}

export interface Preset {
  key: string;
  label: string;
  mg: number;
  mg_low: number;
  mg_high: number;
  emoji: string;
}

export interface CurvePoint {
  t: string;
  mg: number;
}

export interface StateResponse {
  now_mg: number;
  bedtime: string;
  cutoff: string | null;
  headline: string;
  led: Led;
  daily_total_mg: number;
  cap_mg: number;
  curve: CurvePoint[];
  safe_line_mg: number;
  is_simulated: boolean;
}

export interface WhatIfResponse {
  extra_latency_min: { median: number; low: number; high: number };
  curve: CurvePoint[];
  led_after: Led;
  cap_exceeded: boolean;
}

export interface ProfileResponse {
  half_life: { mean: number; sd: number; ci80: [number, number] };
  population_mean_h: number;
  sensitivity: { mean: number; sd: number; label: string };
  posterior: { h_grid: number[]; prob: number[] };
  history: { night: string; h_mean: number; h_low: number; h_high: number }[];
  checkins: SleepNight[];
}

export interface IdentifyResponse {
  gemini: GeminiResult;
  estimate: DrinkEstimate;
  logged?: Drink;
}

export interface DemoSeedResponse {
  users: { id: number; name: string; true_h: number }[];
}

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

export interface DrinkAnalysis {
  verdict: string;
  description: string;
  category: "coffee" | "tea" | "energy_drink" | "soft_drink" | "chocolate" | "other_drink" | "food" | "supplement" | "not_a_drink";
  product_name?: string | null;
  container?: "paper_cup" | "mug" | "glass" | "can" | "bottle" | "carton" | "pod" | "other" | null;
  volume_ml?: number | null;
  volume_source?: "printed" | "estimated" | null;
  temperature?: "hot" | "iced" | "room" | null;
  milk?: string | null;
  additions?: string[];
  visible_text?: string[];
  printed_caffeine?: string | null;
  evidence?: string[];
  alternatives?: { drink: string; confidence: number }[];
  image_issues?: string[];
}

export interface GeminiResult {
  drink: string;
  size: "small" | "regular" | "large" | null;
  shots: number | null;
  brand: string | null;
  decaf: boolean;
  label_mg: number | null;
  confidence: number;
  product?: string | null;
  label_mg_per_100ml?: number | null;
  analysis?: DrinkAnalysis | null;
}

export type Size = "small" | "regular" | "large";

export interface SizeOption {
  ml: number | null;
  mg: number;
  mg_low: number;
  mg_high: number;
}

export interface DrinkEstimate {
  drink_key: string;
  label: string;
  mg: number;
  mg_low: number;
  mg_high: number;
  needs: ("shots" | "decaf" | "size")[];
  auto_accept: boolean;
  /** Where mg came from: printed label > branded product > table scaled by volume > table. */
  basis?: "label" | "product" | "volume" | "table";
  size?: Size | null;
  sizes?: Partial<Record<Size, SizeOption>> | null;
}

export interface Preset {
  key: string;
  label: string;
  mg: number;
  mg_low: number;
  mg_high: number;
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

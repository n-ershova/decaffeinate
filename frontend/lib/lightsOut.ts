// Lights-out time, kept on this device until the morning check-in saves the night.
const KEY = "lights_out";

/** The evening a time belongs to ("YYYY-MM-DD"); times before noon count as the night before. */
export function nightOf(t: Date): string {
  const d = new Date(t);
  if (d.getHours() < 12) d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Lights-out time for `night` as "HH:MM", or null if none was recorded. */
export function getLightsOut(night: string): string | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null") as { night: string; time: string } | null;
    return v?.night === night ? v.time : null;
  } catch {
    return null;
  }
}

export function setLightsOut(t: Date): string {
  const time = `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  try { localStorage.setItem(KEY, JSON.stringify({ night: nightOf(t), time })); } catch { /* storage unavailable */ }
  return time;
}

export function clearLightsOut(): void {
  try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
}

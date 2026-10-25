/** Resolve today's local cutoff once, so the timer cannot roll into tomorrow. */
export function cutoffDeadline(cutoff: string | null, date: Date): number | null {
  if (!cutoff || !/^\d{2}:\d{2}$/.test(cutoff)) return null;
  const [hour, minute] = cutoff.split(":").map(Number);
  if (hour > 23 || minute > 59) return null;
  const deadline = new Date(date);
  deadline.setHours(hour, minute, 0, 0);
  return deadline.getTime();
}

const WARNING_SECONDS = 30 * 60;

export default function CutoffCountdown({ deadline, now }: { deadline: number; now: number }) {
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  const urgent = seconds <= WARNING_SECONDS;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const remaining = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
      <p className="caption" style={{ margin: "0 0 6px" }}>
        {seconds > 0 ? "Time left until your caffeine cutoff" : "Your caffeine window has ended"}
      </p>
      {seconds > 0 ? (
        <p role="timer" aria-live="off" aria-label={`${hours} hours, ${minutes} minutes, ${seconds % 60} seconds until your caffeine cutoff`}
          className="num" style={{ margin: 0, fontSize: "clamp(2rem, 9vw, 3rem)", lineHeight: 1.2,
            letterSpacing: "-0.04em", color: urgent ? "var(--red)" : "var(--text)" }}>
          {remaining}
        </p>
      ) : <p role="status" style={{ margin: 0, color: "var(--red)", fontSize: "1.25rem" }}>Cutoff reached</p>}
      {seconds > 0 && urgent && <p role="status" style={{ margin: "8px 0 0", color: "var(--red)", fontSize: "0.85rem" }}>Your cutoff is approaching — 30 minutes or less left.</p>}
    </div>
  );
}

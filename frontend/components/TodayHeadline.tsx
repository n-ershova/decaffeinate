import type { Led, Preset } from "@/lib/types";

interface Props {
  headline: string;
  cutoff: string | null; // "HH:MM"
  led: Led;
  /** Caffeinated drinks to choose the cutoff for; "" is a standard coffee. */
  drinks?: Preset[];
  drinkKey?: string;
  onDrinkChange?: (key: string) => void;
}

const STATUS: Record<Led, string> = {
  green: "You can still have caffeine",
  amber: "Getting close to your limit",
  red: "Caffeine now will cost you sleep",
};

export default function TodayHeadline({ headline, cutoff, led, drinks, drinkKey = "", onDrinkChange }: Props) {
  return (
    <header aria-label={headline}>
      <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem", color: "var(--muted)" }}>
        <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: `var(--${led})` }} />
        {cutoff && drinks && onDrinkChange ? (
          <span>
            Last{" "}
            {/* The chosen name sets the width; an invisible native select on top keeps the OS picker. */}
            <span className="inline-select">
              {drinks.find((d) => d.key === drinkKey)?.label ?? "coffee"}
              <select aria-label="Drink the cutoff is for" value={drinkKey} onChange={(e) => onDrinkChange(e.target.value)}>
                <option value="">coffee</option>
                {drinks.map((d) => <option key={d.key} value={d.key}>{d.label} · {Math.round(d.mg)} mg</option>)}
              </select>
            </span>{" "}
            today by
          </span>
        ) : cutoff ? "Last coffee today by" : STATUS[led]}
      </p>
      {cutoff ? (
        <p aria-hidden style={{
          margin: "6px 0 0 -0.04em", fontSize: "clamp(5.5rem, 26vw, 9.5rem)", lineHeight: 0.92, fontWeight: 200,
          letterSpacing: "-0.055em", fontFeatureSettings: '"tnum"', color: `var(--${led})`,
        }}>
          {cutoff}
        </p>
      ) : (
        <p aria-hidden style={{
          margin: "14px 0 0", fontSize: "clamp(2.25rem, 9vw, 3.5rem)", lineHeight: 1.02, fontWeight: 200,
          letterSpacing: "-0.04em", color: `var(--${led})`, maxWidth: "11ch",
        }}>
          {headline}
        </p>
      )}
    </header>
  );
}

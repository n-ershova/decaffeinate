// Text from §17 (Limitations and safety).
const POINTS = [
  ["Not medical advice", "HalfLife gives general wellness guidance, not diagnosis or treatment."],
  ["Estimates, not measurements", "Caffeine levels are modelled from the drinks you log. Nothing measures your blood caffeine, so we show ranges, not single numbers."],
  ["Takes a few weeks", "Self-reported sleep is noisy. The model needs about 2 to 3 weeks of check-ins to become useful."],
  ["Hard limits", "HalfLife never suggests drinking more, and stops at 400 mg a day, the limit for healthy adults."],
  ["Not for everyone", "If you are pregnant, under 18, have a heart condition or take medication that interacts with caffeine, follow your doctor's advice instead."],
];

export default function SafetyNotice() {
  return (
    <section>
      <p className="eyebrow">Safety</p>
      <dl style={{ margin: 0 }}>
        {POINTS.map(([title, body]) => (
          <div key={title} style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
            <dt style={{ fontSize: "0.9rem" }}>{title}</dt>
            <dd style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>{body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

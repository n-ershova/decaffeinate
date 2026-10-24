import Link from "next/link";

const STEPS = [
  { title: "Set your bedtime", body: "Tell us when you want to be asleep. Change it any time on Today or in Settings.", href: "/settings" },
  { title: "Log every drink", body: "Photograph it, describe it, or tap a common drink. Your usuals show up first.", href: "/log" },
  { title: "Check your cutoff", body: "Today shows the latest time for one more coffee without losing sleep.", href: "/" },
  { title: "Press Going to sleep", body: "Once the lights are off, press the button on Sleep.", href: "/sleep" },
  { title: "Check in each morning", body: "Say how long it took to fall asleep and how rested you feel. It takes ten seconds.", href: null },
  { title: "Watch it learn", body: "You shows how fast your body clears caffeine. It gets sharper every night.", href: "/you" },
];

export default function About() {
  return (
    <div style={{ display: "grid", gap: 40, maxWidth: 480 }}>
      <header>
        <h1>How it works</h1>
        <p className="caption">Decaffeinate learns how caffeine affects your sleep, then tells you when to stop.</p>
      </header>

      <ol style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid var(--border)" }}>
        {STEPS.map((s, i) => (
          <li key={s.title} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 8, padding: "20px 0", borderBottom: "1px solid var(--border)" }}>
            <span className="num" style={{ fontSize: "0.8rem", color: "var(--muted)", paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p style={{ margin: 0, fontSize: "0.95rem" }}>
                {s.href ? <Link href={s.href} style={{ color: "inherit", textDecoration: "none" }}>{s.title}</Link> : s.title}
              </p>
              <p className="caption" style={{ marginTop: 4 }}>{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
        The more days you log, the better the advice.
      </p>
    </div>
  );
}

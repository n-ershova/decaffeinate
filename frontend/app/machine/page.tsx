import MachineStatus from "@/components/MachineStatus";
import MachineTerminal from "@/components/MachineTerminal";

const LIGHTS = [
  { color: "var(--green)", label: "Green", body: "You can still have caffeine." },
  { color: "var(--amber)", label: "Amber", body: "Getting close to your cutoff." },
  { color: "var(--red)", label: "Red", body: "Caffeine now will cost you sleep." },
];

const STEPS = [
  { title: "Set it on your desk", body: "Plug it in where you can see the light." },
  { title: "Hold up your drink", body: "Hold it close to the camera and keep it still for a second." },
  { title: "That's it", body: "It's logged for you. If it isn't sure, the app asks you to confirm." },
  { title: "Wait 10 seconds", body: "Before scanning the next drink, so nothing is logged twice." },
];

function Drawing() {
  const label = { fontSize: 11, fill: "var(--graphite)", fontFamily: "var(--sans)" } as const;
  const line = { stroke: "var(--graphite)", strokeWidth: 0.75 } as const;
  return (
    <svg viewBox="36 78 418 196" role="img" aria-label="The Decaffeinate Machine: a small box with a camera on top, a status light on the front and a Jetson Orin Nano inside."
      style={{ width: "100%", height: "auto", display: "block", color: "var(--ink)" }}>
      <g fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round">
        {/* desk */}
        <line x1={40} y1={262} x2={440} y2={262} stroke="var(--hairline)" />
        {/* enclosure */}
        <rect x={150} y={132} width={180} height={130} rx={6} />
        {/* Jetson Orin Nano, seen through the box */}
        <rect x={172} y={180} width={96} height={60} rx={3} strokeDasharray="3 4" stroke="var(--graphite)" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1={192 + i * 11} y1={194} x2={192 + i * 11} y2={226} stroke="var(--graphite)" strokeWidth={0.75} />
        ))}
        {/* camera mount and webcam */}
        <line x1={240} y1={132} x2={240} y2={114} />
        <rect x={212} y={88} width={56} height={26} rx={8} />
        <circle cx={240} cy={101} r={7} />
        <circle cx={240} cy={101} r={2.5} fill="currentColor" />
      </g>

      {/* status LED */}
      <circle cx={304} cy={160} r={14} className="machine-led" opacity={0.18} />
      <circle cx={304} cy={160} r={6} className="machine-led" />

      {/* labels */}
      <g {...line}>
        <line x1={270} y1={101} x2={372} y2={101} />
        <line x1={320} y1={160} x2={372} y2={160} />
        <line x1={172} y1={210} x2={112} y2={210} />
      </g>
      <text x={378} y={105} {...label}>Camera</text>
      <text x={378} y={164} {...label}>Status light</text>
      <text x={106} y={207} textAnchor="end" {...label}>Jetson</text>
      <text x={106} y={221} textAnchor="end" {...label}>Orin Nano</text>
    </svg>
  );
}

export default function Machine() {
  return (
    <div style={{ display: "grid", gap: 80, maxWidth: 480 }}>
      <header>
        <h1 style={{ letterSpacing: "0.01em" }}>Decaffeinate Machine</h1>
        <p className="caption">A desk companion that logs your drinks and shows your status at a glance.</p>
      </header>

      <figure style={{ margin: 0, display: "grid", gap: 20 }}>
        <Drawing />
        <figcaption><MachineStatus /></figcaption>
      </figure>

      <section>
        <p className="eyebrow">What it does</p>
        <p style={{ margin: 0, fontSize: "0.95rem", maxWidth: "46ch" }}>
          Hold a drink up to the camera and it&apos;s logged for you. The light shows whether you can still have caffeine today.
        </p>
      </section>

      <section>
        <p className="eyebrow">The light</p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {LIGHTS.map((l) => (
            <li key={l.label} style={{ display: "grid", gridTemplateColumns: "20px 1fr", alignItems: "baseline", padding: "8px 0", fontSize: "0.9rem" }}>
              <span aria-hidden
                style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, transform: "translateY(-1px)" }} />
              <span>{l.label} <span style={{ color: "var(--muted)" }}>· {l.body}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="eyebrow">How to use it</p>
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {STEPS.map((s, i) => (
            <li key={s.title} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 8, padding: "12px 0" }}>
              <span className="num" style={{ fontSize: "0.8rem", color: "var(--muted)", paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>{s.title}</p>
                <p className="caption" style={{ marginTop: 4 }}>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <p className="eyebrow">Privacy</p>
        <p className="caption" style={{ margin: 0 }}>
          Everything is processed on the machine. Only a crop of the drink is sent, never the full picture or your face.
        </p>
      </section>

      <MachineTerminal />
    </div>
  );
}

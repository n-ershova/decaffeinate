export default function Preview() {
  return (
    <>
      <h1>AppShell preview</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <span className="card led-green">Green</span>
        <span className="card led-amber">Amber</span>
        <span className="card led-red">Red</span>
      </div>
      <div className="card">Content area. Hold the logo (desktop sidebar) for 0.7 s to open /demo.</div>
    </>
  );
}

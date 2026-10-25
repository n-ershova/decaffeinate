"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMachine, getMachineLog, useApi, useUserId } from "@/lib/api";
import type { MachineLogKind } from "@/lib/types";

const POLL_MS = 1500;
const KEEP = 200;
const VISIBLE = 10;   // newest lines shown; older ones fade out at the top

type Line = { key: string; time: string; kind: MachineLogKind | "page"; message: string };

const TAG: Record<Line["kind"], { label: string; color: string }> = {
  info: { label: "info", color: "var(--muted)" },
  track: { label: "track", color: "var(--muted)" },
  lost: { label: "lost", color: "var(--muted)" },
  trigger: { label: "scan", color: "var(--ink)" },
  logged: { label: "logged", color: "var(--green)" },
  unsure: { label: "unsure", color: "var(--amber)" },
  error: { label: "error", color: "var(--red)" },
  page: { label: "app", color: "var(--muted)" },
};

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

/** Live feed of what the desk machine sees and sends: tracks, scans and Gemini results. */
export default function MachineTerminal() {
  const userId = useUserId();
  const [lines, setLines] = useState<Line[]>([]);
  const after = useRef(0);
  const inflight = useRef(false);
  const failing = useRef(false);
  const localId = useRef(0);

  const append = useCallback((next: Line[]) => {
    // Sorted by time: the page's own notes can arrive before older history from the server.
    if (next.length) setLines((old) => [...old, ...next].sort((a, b) => a.time.localeCompare(b.time)).slice(-KEEP));
  }, []);
  const note = useCallback((message: string) => {
    append([{ key: `p${localId.current++}`, time: new Date().toISOString(), kind: "page", message }]);
  }, [append]);

  // Poll for entries newer than the last one shown.
  useEffect(() => {
    if (userId === null) return;
    after.current = 0;
    setLines([]);
    let alive = true;
    const poll = async () => {
      if (inflight.current || document.visibilityState === "hidden") return;
      inflight.current = true;
      try {
        const res = await getMachineLog(userId, after.current);
        if (!alive) return;
        if (failing.current) note("reconnected to the server");
        failing.current = false;
        if (res.last < after.current) {
          // The backend restarted and its log began again: read it from the start.
          after.current = 0;
          note("server restarted; log cleared");
          return;
        }
        after.current = Math.max(after.current, res.last);
        append(res.entries.map((e) => ({ key: `s${e.seq}`, time: e.time, kind: e.kind, message: e.message })));
      } catch {
        if (alive && !failing.current) note("can't reach the server; retrying");
        failing.current = true;
      } finally {
        inflight.current = false;
      }
    };
    poll();
    const id = setInterval(poll, POLL_MS);
    document.addEventListener("visibilitychange", poll);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [userId, append, note]);

  // Machine online/offline, from the same heartbeat data as the status pill.
  const { data: machine } = useApi("/machine", getMachine);
  const online = machine?.online;
  const prevOnline = useRef<boolean | undefined>(undefined);
  useEffect(() => {
    if (online === undefined || online === prevOnline.current) return;
    prevOnline.current = online;
    note(online ? "machine online" : "machine offline");
  }, [online, note]);

  const shown = lines.slice(-VISIBLE);
  const faded = lines.length > VISIBLE;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <p className="eyebrow">Live log</p>
        {lines.length > 0 && (
          <button type="button" onClick={() => setLines([])}
            style={{ background: "none", border: 0, padding: 0, cursor: "pointer", color: "var(--muted)",
              fontSize: "0.75rem", fontFamily: "inherit" }}>
            Clear
          </button>
        )}
      </div>
      <div role="log" aria-live="polite" aria-label="Machine activity"
        style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", lineHeight: 1.8,
          // Older lines fade into the page instead of scrolling.
          ...(faded && { maskImage: "linear-gradient(to bottom, transparent, #000 30%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, #000 30%)" }) }}>
        {userId === null ? (
          <span style={{ color: "var(--muted)" }}>Sign in to see your machine&apos;s activity.</span>
        ) : lines.length === 0 ? (
          <span style={{ color: "var(--muted)" }}>Waiting for the machine… hold a drink up to the camera.</span>
        ) : shown.map((l) => (
          <div key={l.key} style={{ display: "grid", gridTemplateColumns: "auto 7ch 1fr", gap: "0 10px" }}>
            <span className="num" style={{ color: "var(--muted)" }}>{clock(l.time)}</span>
            <span style={{ color: TAG[l.kind].color }}>{TAG[l.kind].label}</span>
            <span style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{l.message}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

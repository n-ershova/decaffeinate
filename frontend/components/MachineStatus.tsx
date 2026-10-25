"use client";

import { useEffect } from "react";
import { getMachine, useApi } from "@/lib/api";

const POLL_MS = 3000;

function ago(s: number): string {
  if (s < 60) return `${Math.round(s)} s ago`;
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
}

/** Live connection pill for the desk machine, from its heartbeats to the backend. */
export default function MachineStatus() {
  const { data, error, isLoading, mutate } = useApi("/machine", getMachine);

  useEffect(() => {
    const id = setInterval(mutate, POLL_MS);
    return () => clearInterval(id);
  }, [mutate]);

  let label = "Checking…";
  let detail = "";
  let online = false;
  if (error) {
    label = "Status unknown";
    detail = "can't reach the server";
  } else if (data?.online) {
    online = true;
    label = "Online";
    detail = `last heard from ${ago(data.seconds_ago ?? 0)}`;
  } else if (data?.seconds_ago != null) {
    label = "Offline";
    detail = `last seen ${ago(data.seconds_ago)}`;
  } else if (!isLoading) {
    label = "Not connected";
    detail = "plug it in on the same network";
  }

  return (
    <div role="status" aria-live="polite"
      style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.8rem" }}>
      <span aria-hidden className={online ? "machine-online" : undefined}
        style={{ width: 7, height: 7, borderRadius: "50%", flex: "none",
          background: online ? "var(--green)" : "var(--graphite)", opacity: online ? 1 : 0.6 }} />
      <span>
        {label}
        {detail && <span style={{ color: "var(--muted)" }}> · {detail}</span>}
      </span>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { identifyDrink } from "@/lib/api";
import CameraCapture from "@/components/CameraCapture";
import type { IdentifyResponse, Source } from "@/lib/types";

interface Props {
  userId?: number;
  onResult: (result: IdentifyResponse) => void;
  /** Logs a typed caffeine amount when nothing matched; it is stored as an unknown drink. */
  onManual?: (mg: number, source: Source) => void;
}

const MAX_SIDE = 1024;
const TIMEOUT_MS = 12_000;
const MAX_MANUAL_MG = 1000; // matches the backend's one-drink ceiling

/** Downscale to at most MAX_SIDE px on the long edge and re-encode as JPEG. */
async function downscale(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.82),
  );
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);
}

export default function CaptureInput({ userId, onResult, onManual }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const manualRef = useRef<HTMLInputElement>(null);
  const [manual, setManual] = useState<Source | null>(null); // source of the unmatched attempt
  const [mg, setMg] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);

  // A photo we can't read sends people to the description box; a description we can't match just says so.
  // Either way, the caffeine amount can be typed in directly.
  function unmatched(source: Source, result?: IdentifyResponse) {
    if (onManual) { setManual(source); setMg(""); }
    if (source === "text") {
      setMessage(result ? "No drink matched." : "Couldn\u2019t check that. Try again.");
      requestAnimationFrame(() => manualRef.current?.focus({ preventScroll: true }));
      return;
    }
    const lead = result?.gemini.analysis?.category === "not_a_drink"
      ? "That doesn\u2019t look like a drink." : "Couldn\u2019t make out the drink.";
    setMessage(`${lead} Try describing it.`);
    requestAnimationFrame(() => textRef.current?.focus({ preventScroll: true }));
  }

  const manualMg = Number(mg);
  const manualValid = mg.trim() !== "" && Number.isFinite(manualMg) && manualMg > 0 && manualMg <= MAX_MANUAL_MG;

  function logManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualValid || !manual || !onManual) return;
    onManual(Math.round(manualMg), manual);
    setManual(null);
    setMessage(null);
    setMg("");
  }

  async function send(input: { image?: Blob; text?: string; source: Source }) {
    setBusy(true);
    setMessage(null);
    setManual(null);
    try {
      const result = await withTimeout(identifyDrink({ ...input, user_id: userId }), TIMEOUT_MS);
      if (result.estimate.drink_key === "unknown") { unmatched(input.source, result); return; }
      onResult(result);
      setText("");
    } catch {
      unmatched(input.source);
    } finally {
      setBusy(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    let image: Blob = file;
    try { image = await downscale(file); } catch { /* send the original */ }
    send({ image, source: "photo" });
  }

  return (
    <div aria-busy={busy}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          className={`photo-action${busy ? " busy" : ""}`} onClick={() => setCameraOpen(true)}
          disabled={busy || cameraOpen} aria-label={busy ? "Recognising" : "Photograph your drink"}
        >
          <span className="camera-btn" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.6l1.4-2h7l1.4 2h2.6A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
          </span>
          <span>{busy ? "Recognising\u2026" : "Photo"}</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} hidden />
      </div>

      {cameraOpen && (
        <CameraCapture
          maxSide={MAX_SIDE}
          onCapture={(image) => { setCameraOpen(false); send({ image, source: "photo" }); }}
          onCancel={() => setCameraOpen(false)}
          // No camera access (permission denied, http origin, no device): fall back to the file picker.
          onUnavailable={() => { setCameraOpen(false); fileRef.current?.click(); }}
        />
      )}

      <div className="or-divider" aria-hidden><span>or</span></div>

      <form
        className="inline-field"
        onSubmit={(e) => { e.preventDefault(); if (text.trim()) send({ text: text.trim(), source: "text" }); }}
      >
        <input
          ref={textRef} value={text} onChange={(e) => setText(e.target.value)} disabled={busy}
          placeholder="Describe it, e.g. large oat flat white" aria-label="Describe your drink" maxLength={300}
        />
        <Submit label="Add" hidden={!text.trim()} disabled={busy} />
      </form>

      {message && <p role="status" className="caption" style={{ margin: "12px 0 0" }}>{message}</p>}

      {manual && (
        <form className="manual-row" onSubmit={logManual}>
          <label htmlFor="manual-mg">Know the caffeine?</label>
          <span className="inline-field">
            <input
              id="manual-mg" ref={manualRef} className="num" type="number" inputMode="numeric"
              min={1} max={MAX_MANUAL_MG} step={1} value={mg} onChange={(e) => setMg(e.target.value)}
              placeholder="80" style={{ flex: "none", width: "4ch" }}
            />
            <span className="unit">mg</span>
          </span>
          <Submit label="Log caffeine" hidden={!manualValid} />
        </form>
      )}
    </div>
  );
}

/** Round arrow that only shows once there's something to submit. */
function Submit({ label, hidden, disabled }: { label: string; hidden: boolean; disabled?: boolean }) {
  return (
    <button type="submit" className={`arrow-submit${hidden ? " idle" : ""}`} disabled={hidden || disabled} aria-label={label}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 7h10M8 3l4 4-4 4" />
      </svg>
    </button>
  );
}

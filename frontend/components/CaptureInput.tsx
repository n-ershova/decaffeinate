"use client";

import { useRef, useState } from "react";
import { identifyDrink } from "@/lib/api";
import type { IdentifyResponse, Source } from "@/lib/types";

interface Props {
  onResult: (result: IdentifyResponse) => void;
}

const MAX_SIDE = 1024;
const TIMEOUT_MS = 12_000;

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

export default function CaptureInput({ onResult }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function send(input: { image?: Blob; text?: string; source: Source }) {
    setBusy(true);
    setFailed(false);
    try {
      onResult(await withTimeout(identifyDrink(input), TIMEOUT_MS));
      setText("");
    } catch {
      setFailed(true);
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
        <button className="btn" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? "Recognising…" : "Take photo"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFile} hidden />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (text.trim()) send({ text: text.trim(), source: "text" }); }}
        style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 20 }}
      >
        <input
          className="field" value={text} onChange={(e) => setText(e.target.value)} disabled={busy}
          placeholder="Or describe it — “large oat flat white”" aria-label="Describe your drink"
        />
        <button type="submit" className="link" disabled={busy || !text.trim()} style={{ whiteSpace: "nowrap" }}>Add</button>
      </form>

      {failed && (
        <p style={{ margin: "12px 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
          Couldn&apos;t recognise that. Pick a preset below.
        </p>
      )}
    </div>
  );
}

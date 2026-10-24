"use client";

import { useEffect, useRef, useState } from "react";

type Drink = { time: string; drink_key: string; mg: number };
type Reading = { time: string; hr_bpm: number; br_bpm: number; drink_time: string | null };
type Phase = "idle" | "settling" | "recording" | "processing";
const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
const SETTLE_SECONDS = 5;
const SCAN_SECONDS = 30;

export default function HeartRatePage() {
  const [userId, setUserId] = useState(1);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [drinkTime, setDrinkTime] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState("");
  const [reading, setReading] = useState<Reading | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const active = useRef(true);
  const cancelled = useRef(false);
  const abort = useRef<AbortController | null>(null);

  function releaseCamera() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }

  useEffect(() => {
    active.current = true;
    const value = Number(new URLSearchParams(window.location.search).get("user_id") || 1);
    setUserId(Number.isInteger(value) && value > 0 ? value : 1);
    return () => {
      active.current = false;
      cancelled.current = true;
      abort.current?.abort();
      if (recorder.current?.state === "recording") recorder.current.stop();
      releaseCamera();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(API + "/drinks?user_id=" + userId + "&days=2", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Could not load recent drinks.");
        return response.json() as Promise<Drink[]>;
      })
      .then(items => {
        const recent = [...items].reverse();
        setDrinks(recent);
        setDrinkTime(recent[0]?.time || "");
      })
      .catch(cause => {
        if (cause.name !== "AbortError") setError(cause.message);
      });
    return () => controller.abort();
  }, [userId]);

  function cancel() {
    cancelled.current = true;
    abort.current?.abort();
    if (recorder.current?.state === "recording") recorder.current.stop();
    releaseCamera();
    setPhase("idle");
  }

  async function start() {
    setError("");
    cancelled.current = false;
    setPhase("settling");
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Camera recording needs a supported browser on HTTPS or localhost.");
      }
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
        audio: false
      });
      if (!active.current || cancelled.current) {
        media.getTracks().forEach(track => track.stop());
        return;
      }
      stream.current = media;
      if (video.current) {
        video.current.srcObject = media;
        await video.current.play();
      }
      const mime = ["video/webm;codecs=vp8", "video/webm", "video/mp4"]
        .find(type => MediaRecorder.isTypeSupported(type));
      if (!mime) throw new Error("This browser has no supported recording format.");
      const capture = new MediaRecorder(media, { mimeType: mime, videoBitsPerSecond: 4000000 });
      recorder.current = capture;
      const chunks: BlobPart[] = [];
      capture.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      capture.onerror = () => {
        cancelled.current = true;
        releaseCamera();
        if (active.current) { setError("Camera recording failed. Please retry."); setPhase("idle"); }
      };
      capture.onstop = async () => {
        releaseCamera();
        if (cancelled.current || !active.current) return;
        setPhase("processing");
        abort.current = new AbortController();
        const body = new FormData();
        body.append("video", new Blob(chunks, { type: mime.split(";")[0] }), mime.includes("mp4") ? "scan.mp4" : "scan.webm");
        body.append("user_id", String(userId));
        if (drinkTime) body.append("drink_time", drinkTime);
        try {
          const response = await fetch(API + "/hr/scan", { method: "POST", body, signal: abort.current.signal });
          const result = await response.json();
          if (!response.ok) throw new Error(result.detail || "The scan could not be processed.");
          if (active.current && !cancelled.current) setReading(result);
        } catch (cause) {
          if (active.current && !cancelled.current) setError(cause instanceof Error ? cause.message : "Could not save reading.");
        } finally {
          if (active.current) setPhase("idle");
        }
      };
      setPhase("settling");
      setSeconds(30);
      capture.start(1000);
      const began = Date.now();
      timer.current = setInterval(() => {
        const elapsed = (Date.now() - began) / 1000;
        if (elapsed >= SETTLE_SECONDS) {
          setPhase("recording");
          setSeconds(Math.max(0, Math.ceil(SETTLE_SECONDS + SCAN_SECONDS - elapsed)));
        }
        if (elapsed >= SETTLE_SECONDS + SCAN_SECONDS && capture.state === "recording") capture.stop();
      }, 100);
    } catch (cause) {
      releaseCamera();
      if (active.current) {
        setError(cause instanceof Error ? cause.message : "Could not open the camera.");
        setPhase("idle");
      }
    }
  }

  const due = drinkTime ? new Date(new Date(drinkTime).getTime() + 45 * 60000) : null;
  const busy = phase !== "idle";
  return <main>
    <header><span className="brand">halflife<span aria-hidden="true"> ◒</span></span><span className="eyebrow">A moment to check in</span></header>
    <span className="eyebrow">Camera check</span>
    <h1>How is your body feeling?</h1>
    <p>A quiet, 30-second heart and breathing rate check with Presage. Sit still in good light, with your face and upper chest in view.</p>
    <section className="panel" aria-label="Camera scan">
      <label htmlFor="drink">Link this check to a drink</label>
      <select id="drink" value={drinkTime} disabled={busy} onChange={event => setDrinkTime(event.target.value)}>
        <option value="">No linked drink</option>
        {drinks.map((drink, index) => <option key={drink.time + index} value={drink.time}>
          {drink.drink_key.replaceAll("_", " ")} · {drink.mg} mg · {new Date(drink.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </option>)}
      </select>
      <p className="hint">{due ? "Aim to scan around " + due.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", about 45 minutes after this drink." : "You can also take a check without linking a drink."}</p>
      <div className="camera"><video ref={video} muted playsInline aria-label="Camera preview" /></div>
      <div role="status" aria-live="polite">
        <p>{phase === "settling" ? "Get comfortable. Your scan starts in a moment." :
          phase === "recording" ? seconds + " seconds left. Stay still and breathe naturally." :
          phase === "processing" ? "Processing your scan and saving the reading…" : "Your camera starts only when you choose to scan."}</p>
      </div>
      {(phase === "settling" || phase === "recording") && <progress aria-label="Scan progress" max={30} value={30 - seconds} />}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions">
        <button onClick={start} disabled={busy}>Start 30-second scan</button>
        {busy && <button className="secondary" onClick={cancel}>Cancel</button>}
      </div>
      <p className="hint">The recording is sent to your Halflife server for processing and deleted afterwards. Your reading is saved.</p>
    </section>
    {reading && <section className="panel" aria-label="Saved reading">
      <span className="eyebrow">Reading saved</span>
      <div className="metrics">
        <div className="metric">Heart rate<strong>{reading.hr_bpm.toFixed(0)}</strong><span>beats per minute</span></div>
        <div className="metric">Breathing rate<strong>{reading.br_bpm.toFixed(1)}</strong><span>breaths per minute</span></div>
      </div>
      <p className="hint">Saved at {new Date(reading.time).toLocaleTimeString()}. These readings are separate from your caffeine and sleep model.</p>
    </section>}
    <footer>A wellness check for your own information, not a medical measurement.</footer>
  </main>;
}

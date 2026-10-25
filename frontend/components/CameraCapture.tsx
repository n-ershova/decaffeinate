"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  maxSide: number;
  onCapture: (image: Blob) => void;
  onCancel: () => void;
  /** Called when the camera can't be opened (no permission, insecure origin, no device). */
  onUnavailable: () => void;
}

/** Live camera preview in a box, with a button to take the picture. */
export default function CameraCapture({ maxSide, onCapture, onCancel, onUnavailable }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) { onUnavailable(); return; }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((stream) => {
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => { if (!cancelled) onUnavailable(); });
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
    setFlash(true);
    canvas.toBlob((b) => { if (b) setTimeout(() => onCapture(b), 220); }, "image/jpeg", 0.82);
  }

  return (
    <div className={`viewfinder${ready ? " ready" : ""}`}>
      <video ref={videoRef} autoPlay playsInline muted onLoadedMetadata={() => setReady(true)} />
      {!ready && <p className="viewfinder-status">Starting camera…</p>}
      <div className="viewfinder-corners" aria-hidden><span /><span /><span /><span /></div>
      <button className="viewfinder-close" onClick={onCancel} aria-label="Close camera">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </button>
      <button className="shutter" onClick={capture} disabled={!ready || flash} aria-label="Take photo" />
      {flash && <div className="viewfinder-flash" />}
    </div>
  );
}

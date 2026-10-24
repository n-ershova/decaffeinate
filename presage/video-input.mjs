import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

// Decode browser MP4/WebM independently of the SDK's Windows file backend.
// Raw frames never leave this process/server and are never written to disk.
export async function feedVideo(sdk, videoPath, ffmpeg, pixelFormat, signal) {
  const width = 640, height = 480, fps = 30, frameBytes = width * height * 3;
  const child = spawn(ffmpeg, ["-hide_banner", "-loglevel", "error", "-nostdin",
    "-i", videoPath, "-t", "45", "-an", "-vf",
    "fps=30,scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2",
    "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"],
    { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
  // Drain stderr without exposing its contents (paths or media metadata).
  child.stderr.resume();
  let spawnError = null, code = null;
  const closed = new Promise(resolve => {
    child.once("error", error => { spawnError = error; resolve(); });
    child.once("close", status => { code = status; resolve(); });
  });
  const cancel = () => child.kill();
  signal.addEventListener("abort", cancel, { once: true });
  let buffer = Buffer.alloc(0), frames = 0;
  const firstTimestamp = process.hrtime.bigint() / 1000n;
  try {
    if (signal.aborted) return;
    for await (const chunk of child.stdout) {
      if (signal.aborted) return;
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length >= frameBytes) {
        if (signal.aborted) return;
        const frame = buffer.subarray(0, frameBytes);
        buffer = buffer.subarray(frameBytes);
        sdk.sendFrame(frame, width, height, width * 3, pixelFormat,
                      firstTimestamp + BigInt(Math.round(frames * 1000000 / fps)));
        frames++;
        // Pace input so the native pipeline can process each frame without a
        // burst of an entire recording overwhelming its live-input queue.
        await delay(1000 / fps, undefined, { signal });
      }
    }
    await closed;
    if (!signal.aborted && (spawnError || code !== 0 || !frames || buffer.length)) {
      const error = new Error("Video decoding failed");
      error.kind = "video_decode";
      throw error;
    }
  } finally {
    signal.removeEventListener("abort", cancel);
    if (child.exitCode === null) child.kill();
    await closed;
  }
}

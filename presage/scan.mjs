// Official recorded-video workflow:
// https://smartspectra.presagetech.com/docs/nodejs/headless-testing-in-ci
import { measureFile } from "./pipeline.mjs";
import { feedVideo } from "./video-input.mjs";
let result;
try {
  const { SmartSpectraSDK, SmartSpectraLogLevel, PixelFormat, breathingMetrics, cardioMetrics } =
    await import("@smartspectra/node-sdk");
  const { decodeMetrics } = await import("@smartspectra/node-sdk/messages");
  if (!process.env.PRESAGE_API_KEY || !process.argv[2] || !process.env.PRESAGE_FFMPEG) {
    result = { ok: false, error: "configuration" };
  } else {
    const sdk = new SmartSpectraSDK({
      apiKey: process.env.PRESAGE_API_KEY,
      requestedMetrics: [...breathingMetrics, ...cardioMetrics],
      enableAccumulatedOutput: true,
      enableTelemetry: false,
      logLevel: SmartSpectraLogLevel.kNone
    });
    result = await measureFile(sdk, decodeMetrics, process.argv[2], 75000,
      (sdk, signal) => feedVideo(sdk, process.argv[2], process.env.PRESAGE_FFMPEG, PixelFormat.kRGB, signal));
  }
} catch (error) {
  // Do not expose native exception messages, paths, credentials or recordings.
  result = { ok: false, error: error.code === "ERR_MODULE_NOT_FOUND" ? "runtime" : "sdk",
    sdk_code: Number.isInteger(error.code) ? error.code : null };
}
console.log(JSON.stringify(result));
process.exitCode = result.ok ? 0 : 1;

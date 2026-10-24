// SDK-independent lifecycle logic, tested without a camera or fabricated vitals.
export async function measureFile(sdk, decodeMetrics, videoPath, timeoutMs = 75000, input = null) {
  let pulse = null, breathing = null, active = false, finish, timer;
  const controller = new AbortController();
  let feeding = null;
  const diagnostics = { error: null, sdk_code: null, validation_code: 0,
    validation_counts: {}, pulse_samples: 0, breathing_samples: 0, ran: false };
  const settled = new Promise(resolve => {
    finish = resolve;
    timer = setTimeout(() => { diagnostics.error = "timeout"; resolve(); }, timeoutMs);
  });
  const onMetrics = buffer => {
    try {
      const metrics = decodeMetrics(buffer);
      const p = metrics.cardio?.pulseRate || [];
      const b = metrics.breathing?.rate || [];
      diagnostics.pulse_samples += p.length;
      diagnostics.breathing_samples += b.length;
      const reliable = x => x.confidence > 0 && x.stable !== false && Number.isFinite(x.value) && x.value > 0;
      const lastPulse = p.findLast(reliable), lastBreathing = b.findLast(reliable);
      if (lastPulse) pulse = lastPulse.value;
      if (lastBreathing) breathing = lastBreathing.value;
    } catch {
      diagnostics.error = "metrics_decode";
      finish();
    }
  };
  sdk.on("metrics", onMetrics);
  sdk.on("accumulatedMetrics", onMetrics);
  sdk.on("validationStatus", code => {
    if (Number.isInteger(code) && code >= 0 && code <= 14) {
      diagnostics.validation_counts[code] = (diagnostics.validation_counts[code] || 0) + 1;
      diagnostics.validation_code = code;
    }
  });
  sdk.on("processingStatus", status => {
    if (status === 2 || status === 3) active = true;
    if (status === 3) diagnostics.ran = true;
    if (status === 5) { diagnostics.error ||= "sdk"; finish(); }
    if (status === 1 && active) finish();
  });
  sdk.on("error", code => {
    diagnostics.error = "sdk";
    diagnostics.sdk_code = Number.isInteger(code) ? code : null;
    finish();
  });
  try {
    if (input) {
      sdk.useCustomInput();
      sdk.start();
      feeding = input(sdk, controller.signal).then(() => finish()).catch(error => {
        if (!diagnostics.error) {
          diagnostics.error = error.kind || "video_decode";
          diagnostics.sdk_code = Number.isInteger(error.code) ? error.code : null;
        }
        finish();
      });
    } else {
      sdk.useFile(videoPath, { maxDurationMs: 45000 });
      sdk.start();
    }
    await settled;
  } catch (error) {
    diagnostics.error = "sdk";
    diagnostics.sdk_code = Number.isInteger(error.code) ? error.code : null;
  } finally {
    clearTimeout(timer);
    controller.abort();
    if (feeding) await feeding;
    try {
      await sdk.stopAsync();
      // End-of-file and final metrics use separate queued native callbacks.
      await new Promise(resolve => setImmediate(resolve));
      await sdk.destroy();
    } catch {
      diagnostics.error ||= "runtime";
    }
  }
  if (!diagnostics.error && pulse !== null && breathing !== null) {
    return { ok: true, hr_bpm: pulse, br_bpm: breathing };
  }
  diagnostics.error ||= pulse === null && breathing === null ? "no_rates" :
    pulse === null ? "no_pulse" : "no_breathing";
  return { ok: false, ...diagnostics };
}

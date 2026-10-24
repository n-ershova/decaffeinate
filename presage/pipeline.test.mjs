import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { measureFile } from "./pipeline.mjs";

class SDK extends EventEmitter {
  constructor(start) { super(); this.begin = start; this.stopped = false; this.destroyed = false; }
  useFile(path, options) { this.path = path; this.options = options; }
  start() { this.begin(this); }
  async stopAsync() { this.stopped = true; }
  async destroy() { this.destroyed = true; }
}
const rate = value => ({value, confidence:90, stable:true});
const both = {cardio:{pulseRate:[rate(72)]}, breathing:{rate:[rate(14)]}};

test("collects final accumulated metrics during stop before destroy", async () => {
  const sdk = new SDK(s => { s.emit("processingStatus",3); s.emit("processingStatus",1); });
  sdk.stopAsync = async () => {
    await new Promise(resolve => setImmediate(resolve));
    sdk.emit("accumulatedMetrics", both);
    sdk.stopped = true;
  };
  const result = await measureFile(sdk,x=>x,"video.webm");
  assert.deepEqual(result,{ok:true,hr_bpm:72,br_bpm:14});
  assert.ok(sdk.stopped && sdk.destroyed);
});

test("reports SDK errors that happen before Running", async () => {
  const sdk = new SDK(s => { s.emit("processingStatus",2); s.emit("error",7); s.emit("processingStatus",5); });
  const result = await measureFile(sdk,x=>x,"video.mp4");
  assert.equal(result.sdk_code,7);
  assert.equal(result.ok,false);
  assert.ok(sdk.destroyed);
});

test("preserves real validation feedback instead of guessing lighting", async () => {
  const sdk = new SDK(s => {
    s.emit("processingStatus",3);
    s.emit("validationStatus",7);
    s.emit("metrics",{cardio:{pulseRate:[rate(72)]}});
    s.emit("processingStatus",1);
  });
  const result = await measureFile(sdk,x=>x,"video.webm");
  assert.equal(result.error,"no_breathing");
  assert.equal(result.validation_code,7);
  assert.equal(result.pulse_samples,1);
});

test("zero-confidence or unstable readings never become saved vitals", async () => {
  const sdk = new SDK(s => {
    s.emit("processingStatus",3);
    s.emit("metrics",{cardio:{pulseRate:[{...rate(72),confidence:0}]},
                      breathing:{rate:[{...rate(14),stable:false}]}});
    s.emit("processingStatus",1);
  });
  const result = await measureFile(sdk,x=>x,"video.webm");
  assert.equal(result.ok,false);
  assert.equal(result.error,"no_rates");
});

test("timeouts clean up the native session", async () => {
  const sdk = new SDK(s => s.emit("processingStatus",2));
  const result = await measureFile(sdk,x=>x,"video.webm",5);
  assert.equal(result.error,"timeout");
  assert.ok(sdk.stopped && sdk.destroyed);
});

test("bad protobuf payloads produce safe diagnostics", async () => {
  const sdk = new SDK(s => { s.emit("processingStatus",3); s.emit("metrics",Buffer.alloc(0)); });
  const result = await measureFile(sdk,()=>{throw new Error("secret");},"video.webm");
  assert.equal(result.error,"metrics_decode");
  assert.ok(!JSON.stringify(result).includes("secret"));
});

test("custom decoded frames use custom input and flush final measurements", async () => {
  const sdk = new SDK(s => s.emit("processingStatus",3));
  sdk.useCustomInput = () => { sdk.custom = true; };
  const result = await measureFile(sdk,x=>x,"video.webm",1000,async s => {
    s.emit("metrics",both);
  });
  assert.ok(sdk.custom && sdk.destroyed);
  assert.equal(result.ok,true);
});

test("decoder failures terminate without reporting a lighting problem", async () => {
  const sdk = new SDK(s => s.emit("processingStatus",3));
  sdk.useCustomInput = () => {};
  const result = await measureFile(sdk,x=>x,"video.webm",1000,async () => {
    const error = new Error("private filename"); error.kind = "video_decode"; throw error;
  });
  assert.equal(result.error,"video_decode");
  assert.ok(sdk.destroyed);
});

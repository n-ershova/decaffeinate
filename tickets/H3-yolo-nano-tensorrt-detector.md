# H3 · YOLO nano → TensorRT detector

**Should · D · 3h · Files:** `jetson/detector.py`, `jetson/export_engine.sh`
- Export Ultralytics YOLO nano to TensorRT (FP16) on the Orin Nano, and filter detections to cup, bottle and wine glass.
- Falls back to the `.pt` model on a laptop.
- **Done when:** it runs at ≥ 15 FPS on the Jetson with a mug held up. **Midnight go/no-go** (§14.2).

## Track note

Every Jetson module except H3 must also run on a laptop (with a webcam, and GPIO mocked when `Jetson.GPIO` won't import).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

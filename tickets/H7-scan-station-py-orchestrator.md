# H7 · `scan_station.py` orchestrator

**Should · D · 1h · Files:** `jetson/scan_station.py`
- Camera loop → `Detector` → `Trigger` → white flash → `upload_crop`, with `run_state_loop` running in a thread. The `--fallback` flag uses H6 instead.
- **Develop in isolation:** code only against the 0.6 signatures; run with stubs.
- **Done when:** it runs end to end on a laptop against `make api`.

## Track note

Every Jetson module except H3 must also run on a laptop (with a webcam, and GPIO mocked when `Jetson.GPIO` won't import).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

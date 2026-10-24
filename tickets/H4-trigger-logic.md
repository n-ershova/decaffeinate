# H4 · Trigger logic

> Decide when a drink is being deliberately held up to the camera, and avoid double logging.

**Should · D · 1.5h · Files:** `jetson/trigger.py`, `jetson/tests/test_trigger.py` · §8.3
- The box centre must be in the middle 40% of the frame, the area ≥ 8% of the frame, and the IoU with the previous box ≥ 0.6 for 1 second. Then a 10-second cooldown. Pure logic with no camera.
- **Done when:** unit tests on synthetic box sequences cover firing, jitter, a drink that is too small, and cooldown.

## Track note

Every Jetson module except H3 must also run on a laptop (with a webcam, and GPIO mocked when `Jetson.GPIO` won't import).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

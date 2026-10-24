# H6 · Button-capture fallback

> Backup mode: press a button to snap and send one photo if automatic detection is unreliable.

**Should · D · 1h · Files:** `jetson/button_capture.py` · §8.4
- A GPIO button (or the Enter key on a laptop) grabs one frame and uploads the centre crop.
- **Done when:** it works without YOLO.

## Track note

Every Jetson module except H3 must also run on a laptop (with a webcam, and GPIO mocked when `Jetson.GPIO` won't import).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

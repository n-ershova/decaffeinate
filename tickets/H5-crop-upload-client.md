# H5 · Crop & upload client

> Crop just the drink from the frame and send it to the backend (faces never leave the device).

**Should · D · 1h · Files:** `jetson/uploader.py`, `jetson/tests/test_uploader.py` · §8.3
- Crop the box plus 10% padding, encode as JPEG, and send it to `POST /drinks/identify` with `source=jetson`. Only the crop leaves the device, never the full frame (privacy).
- **Done when:** a test checks that the crop is sent and not the frame.

## Track note

Every Jetson module except H3 must also run on a laptop (with a webcam, and GPIO mocked when `Jetson.GPIO` won't import).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

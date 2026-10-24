# H2 · LED state loop

**Should · D · 1h · Files:** `jetson/state_loop.py`, `jetson/tests/test_state_loop.py` · §8.3
- Poll `GET /state` every 2 seconds and set the LED. After 3 consecutive failures, slowly blink amber. Exit cleanly when `stop` is set.
- **Develop in isolation:** a tiny `http.server` fake returning fixture JSON, and a fake `Led`.
- **Done when:** the tests cover a colour change and the offline blink.

## Track note

Every Jetson module except H3 must also run on a laptop (with a webcam, and GPIO mocked when `Jetson.GPIO` won't import).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

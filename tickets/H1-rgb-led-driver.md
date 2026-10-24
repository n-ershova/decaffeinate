# H1 · RGB LED driver

> Control the red, amber and green LED on the Jetson.

**Should · D · 1h · Files:** `jetson/led.py` · §8.2
- Common-cathode LED on 3 GPIO pins, with pins set by env. Amber is red plus green (PWM if available). `flash()` doesn't block (uses a thread). If GPIO can't import, fall back to printing to the console.
- **Done when:** `python led.py cycle` cycles through the colours on hardware and on a laptop.

## Track note

Every Jetson module except H3 must also run on a laptop (with a webcam, and GPIO mocked when `Jetson.GPIO` won't import).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

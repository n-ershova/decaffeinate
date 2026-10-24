# M5 · Cutoff time decision

> Work out the latest time today the user can have a standard coffee and still sleep well.

**Must · A · 1.5h · Files:** `model/decisions.py`, `tests/test_decisions.py` · §7.8
- For each sample, scan from `now` to `bedtime` in 5-minute steps. Find the latest t where `beta·E(today + 130 mg@t, h)/100 ≤ delta`. Return the 20th percentile of those times.
- Return `None` when today's drinks alone already exceed delta, or when no t passes ("No more caffeine today").
- **Develop in isolation:** use a fake `exposure_fn` that returns the sum of mg × `exp(-(bedtime - t)/h)`.
- **Done when:** a longer h gives an earlier cutoff, an already-high load returns `None`, and 500 samples take under 100 ms.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

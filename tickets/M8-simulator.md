# M8 · Simulator

> Generate fake users with known half-lives and 21 days of history, so the demo can show the model learning.

**Must · A · 2h · Files:** `model/simulate.py`, `tests/test_simulate.py` · §7.12
- Simulate 21 days: a morning coffee between 07:30 and 09:30, plus 0–2 more drinks between 11:00 and 18:00 at varied times, with alcohol on about 20% of evenings and bedtime jittered ±30 minutes.
- Draw latency `mu + beta·E/100 + gamma·A + N(0,12)`, clipped at 1 minute. Every drink has `source="simulated"`.
- Fully deterministic for a given seed.
- **Done when:** the same seed produces identical output, and users with h = 3 and h = 8 have identical drink times but different latencies.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

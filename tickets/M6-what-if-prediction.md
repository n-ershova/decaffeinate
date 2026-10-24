# M6 · What-if prediction

> Predict how many extra minutes it will take to fall asleep if the user has a given drink now.

**Must · A · 1h · Files:** `model/whatif.py`, `tests/test_whatif.py` · §7.8
- Compute the extra latency `beta·(E(today+proposed) − E(today))/100` per sample, and return the median and the 10th and 90th percentiles.
- **Done when:** a zero-mg drink gives 0, and results are monotonic in mg and in how late the drink is.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

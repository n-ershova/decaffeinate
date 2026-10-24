# M9 · Experiment day suggestions

> Suggest a drink time that would teach the model the most without risking a bad night. (Stretch)

**Could · A · 1.5h · Files:** `model/experiment.py`, `tests/test_experiment.py` · §7.10
- For each candidate time, compute the variance across samples of `beta·E/100`. Keep only candidates that are safe at relaxed tolerance (20 minutes), and return the candidate with the highest variance.
- **Done when:** it returns `None` if nothing is safe, and prefers afternoon times when h is uncertain.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

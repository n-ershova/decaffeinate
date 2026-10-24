# E1 · Engine service

> Connect the model pieces to the stored data and produce the numbers each screen shows.

**Must · A · 2h · Files:** `services/engine.py`, `tests/test_engine.py`
- The only place that imports the model modules. `state()` loads the user, today's drinks, and all drinks, alcohol and sleep. It fits the posterior (exposures from `curve.sleep_exposure` per night), draws 500 samples with a seeded RNG, and assembles `StateResponse`.
- `whatif()` and `profile()` work the same way. Profile `history` refits on the first n nights for n = 0…N.
- Use the bedtime from the user when no check-in exists. "Today" is local midnight to now.
- **Develop in isolation:** the tests use an inline 40-line dict-backed fake `Repo` and monkeypatch the model functions with simple stand-ins until M1–M7 land.
- **Done when:** with the real model and fake repo, `state()` returns valid `StateResponse` JSON in under 200 ms.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

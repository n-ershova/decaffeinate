# E3 · `/profile` route

**Should · B · 1.5h · Files:** `routes/profile.py`, `tests/test_routes_profile.py`
- Same pattern as E2. Downsample `posterior.h_grid` and `prob` to 60 points for the chart.
- **Done when:** the tests pass against a fake engine.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

# E2 · `/state` and `/whatif` routes

> API endpoints for the Today screen: the current caffeine state and the what-if prediction.

**Must · B · 1h · Files:** `routes/state.py`, `tests/test_routes_state.py`
- Thin routes using `Depends(get_engine)` and `Depends(get_now)`. Validate the input with pydantic. Return 404 for an unknown user.
- **Develop in isolation:** override `get_engine` with a fake returning fixture JSON.
- **Done when:** `TestClient` tests pass and the JSON matches 0.4 exactly.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

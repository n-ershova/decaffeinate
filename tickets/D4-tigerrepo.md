# D4 · `TigerRepo`

> Read and write all app data in Tiger Data (Postgres).

**Must · B · 2.5h · Files:** `db/tiger_repo.py`, `tests/test_tiger_repo.py`
- Implement `Repo` with psycopg 3 and a connection pool. `daily_total_mg` reads `daily_caffeine` with real-time aggregation, so drinks logged a moment ago are included.
- **Done when:** the integration tests (skipped without `DATABASE_URL`) pass for every method.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

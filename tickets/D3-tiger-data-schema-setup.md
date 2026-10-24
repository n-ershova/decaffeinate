# D3 · Tiger Data schema & setup

> Create the Tiger Data database tables for drinks, alcohol, sleep and heart rate, plus the daily totals view.

**Must · B · 1.5h · Files:** `db/schema.sql`, `scripts/db_setup.sh` · §11
- Use the schema from §11 as written: hypertables, and the `daily_caffeine` continuous aggregate with a refresh policy.
- Make it idempotent (`IF NOT EXISTS`). The script runs it against `DATABASE_URL`.
- **Done when:** running it twice on a fresh Tiger Data service succeeds both times.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

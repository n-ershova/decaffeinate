# D7 · Logging routes

**Must · B · 1.5h · Files:** `routes/logging.py`, `tests/test_routes_logging.py`
- `POST/GET /drinks`, `POST /alcohol`, `POST /sleep` (upsert), `GET /sleep/pending` (true if last night has no entry and the local time is after 05:00), and `GET /presets` (reads `data/drinks.json` directly).
- `time` defaults to the server's now.
- **Done when:** the tests pass with a fake repo.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

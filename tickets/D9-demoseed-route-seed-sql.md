# D9 · `/demo/seed` route & seed SQL

**Must · B · 1.5h · Files:** `routes/demo.py`, `data/seed_demo.sql`, `tests/test_routes_demo.py` · §5.2 Demo, §7.12
- Reset users 2 and 3, then create "Sam (fast, h=3)" and "Alex (slow, h=8)" with `is_simulated=true`, the same seed and the same beta. Call `simulate_user` and write the history to the repo.
- Also export the result as `seed_demo.sql` for loading without the API.
- **Develop in isolation:** monkeypatch `simulate_user` with a fixture `SimHistory`.
- **Done when:** calling seed twice leaves exactly 2 simulated users.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

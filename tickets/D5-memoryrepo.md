# D5 · `MemoryRepo`

**Must · B · 1h · Files:** `db/memory_repo.py`, `tests/test_memory_repo.py`
- Implement `Repo` with dicts and lists, thread-safe with a lock. Creates user 1 ("You", bedtime 23:30) on init.
- This is the offline demo fallback if Tiger Data or the Wi-Fi fails.
- **Done when:** it passes the same test cases as D4 (copy them; don't share the file).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

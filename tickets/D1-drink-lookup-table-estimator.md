# D1 · Drink lookup table & estimator

**Must · B · 2h · Files:** `data/drinks.json`, `drinks/lookup.py`, `tests/test_lookup.py` · §6.4, §6.5
- Put every row of §6.5 in JSON: `{key, label, per: "shot"|"serving", mg, low, high, emoji, preset: bool}`.
- `estimate()`: for per-shot drinks, use `shots`, or default to 2 for regular and 3 for large. Mocha adds 10 mg. `decaf` sets mg to 5. A `label_mg` value overrides everything.
- `needs`: ask about shots or size only when the value is ambiguous and the drink is a café drink. Never ask about milk.
- `auto_accept` is true when confidence ≥ 0.8 and the drink is a can or bottle key, or has `label_mg`.
- **Done when:** tests pass for flat white regular (130 mg), large americano (195 mg), decaf latte (5 mg), Red Bull (80 mg, auto-accepted) and `unknown` (needs a preset pick).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

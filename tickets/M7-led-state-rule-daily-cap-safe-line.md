# M7 · LED state rule, daily cap & safe line

**Must · A · 1h · Files:** `model/led.py`, `tests/test_led.py` · §7.8, §7.9
- Green if a 130 mg drink now is within delta for at least 80% of samples. Amber if 45 mg is. Otherwise red. Always red when `daily_total_mg ≥ 400`.
- `safe_line_mg`: return `100·delta / β₈₀`, where β₈₀ is the 80th percentile of beta (guard against β = 0).
- **Done when:** tests cover each colour and the cap override.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

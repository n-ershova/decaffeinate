# M10 · Plan my day

**Could · A · 2h · Files:** `model/plan.py`, `tests/test_plan.py` · §7.13
- Brute-force up to 3 drinks drawn from {0, 45, 65, 130 mg} at 30-minute slots. Maximise the 20th-percentile amount at `target`, subject to the cutoff tolerance and the cap.
- **Done when:** the plan respects the cap and tolerance, and an empty plan is returned if nothing is feasible.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

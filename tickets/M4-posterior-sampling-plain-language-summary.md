# M4 · Posterior sampling & plain-language summary

> Draw samples from the learned estimate and describe it in plain language ("7.1 h ± 1.0", "Average sensitivity").

**Must · A · 1h · Files:** `model/sampling.py`, `tests/test_sampling.py` · §7.6, §5.2 You
- `sample`: draw grid indices by `h_prob`, then draw `w ~ N(m_N, S_N)` and clip beta at 0. Return an `(n,4)` array.
- `summarize`: return the mean, sd and 80% interval of h from the grid, and the mixture mean and sd of beta. Set `sensitivity_label` to "Low" if β < 3, "Average" if β ≤ 9, otherwise "High".
- **Done when:** sample statistics are within 5% of the analytic values on a hand-built `Posterior`.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

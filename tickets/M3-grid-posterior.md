# M3 · Grid posterior

**Must · A · 3h · Files:** `model/posterior.py`, `tests/test_posterior.py` · §7.6
- For each h in `H_GRID`, build `X = [1, exposures(h)/100, alcohol]`. Compute `S_N` and `m_N`, and the log marginal likelihood from `N(X m0, σ²I + X S0 Xᵀ)` (use `scipy.stats.multivariate_normal` or a Cholesky decomposition).
- Add `log_prior_h` (copy the 3-line formula locally and don't import M2; the prior arrives as the `Prior` object). Normalise with log-sum-exp.
- Handle zero nights by returning the prior unchanged.
- **Develop in isolation:** generate data inside the test with a fake `exposures(h)`, e.g. `lambda h: base * np.exp(-np.log(2)/h * gaps)`.
- **Done when:** on 21 synthetic nights generated with true h = 3 and with true h = 8, the posterior mode is within 30% of the truth. 200 grid points × 21 nights runs in under 50 ms.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

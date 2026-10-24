# M2 · Priors from onboarding

**Must · A · 1h · Files:** `model/priors.py`, `tests/test_priors.py` · §5.1, §7.5
- Start from `h0 = 5`. Multiply by 0.6 for a smoker and by 1.8 for hormonal contraception (both apply if both are true). `log_h_sd = 0.4`.
- Set `m0 = [15, 6, 0]` and `S0 = diag([100, 36, 25])`.
- `log_prior_h`: return the log density of a Normal on log h, evaluated on the grid.
- **Done when:** tests cover all 4 smoker/contraception combinations, and the default prior's 2σ range is about 2.2 to 11 h.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

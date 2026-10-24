# M1 · Caffeine curve & closed-form sleep exposure

**Must · A · 1.5h · Files:** `model/curve.py`, `tests/test_curve.py` · §7.2, §7.3
- `amount_at`: compute `sum D_i * exp(-k (t - t_i))` over drinks with `t_i <= t`, where `k = ln2/h`.
- `curve`: return points from `start` to `end` every `step_min`.
- `sleep_exposure`: use the closed form for the mean over `[T_b, T_b+W]`. A drink before bedtime contributes `D·e^{-k(T_b - t_i)}·(1 - e^{-kW})/(kW)`. A drink inside the window contributes its integral from `t_i` divided by `W`. Drinks after the window contribute nothing.
- **Done when:** tests pass for one drink (exactly half remains after `h` hours), for linearity (two drinks equal the sum of each alone), and for the closed form matching a 1-minute numerical mean to within 0.1%.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

# F15 · Settings & safety

> Settings for tolerance and bedtime, plus the safety and not-medical-advice information.

**Should · C · 1h · Files:** `components/SettingsForm.tsx`, `components/SafetyNotice.tsx` · §7.8, §17
- Tolerance Strict/Normal/Relaxed and bedtime, saved with `PATCH /users/{id}`. Safety text taken from §17.
- **Done when:** saving works in mock mode.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

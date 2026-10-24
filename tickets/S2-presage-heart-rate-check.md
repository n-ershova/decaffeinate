# S2 · Presage heart rate check

**Could · D · 2.5h · Files:** `routes/hr.py`, `frontend/app/hr/page.tsx` (own page, not linked from the nav until merged) · §9
- A 30-second Presage scan about 45 minutes after a drink, saved via `/hr` and shown on the page. Not used by the model.
- **Done when:** one real reading is saved and shown.

## Track note

Every Jetson module except H3 must also run on a laptop (with a webcam, and GPIO mocked when `Jetson.GPIO` won't import).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

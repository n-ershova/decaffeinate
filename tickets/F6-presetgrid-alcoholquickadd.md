# F6 · `PresetGrid` + `AlcoholQuickAdd`

**Must · C · 1.5h · Files:** `components/PresetGrid.tsx`, `components/AlcoholQuickAdd.tsx`
- A grid of emoji tiles with mg values. Alcohol buttons: pint (2.3 units), glass of wine (2.1), spirit (1).
- **Done when:** the callbacks fire with the right payloads.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

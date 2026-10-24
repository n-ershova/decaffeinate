# F5 · `WhatIfPanel`

> The "Have another one now?" button showing how a drink would change tonight's sleep.

**Must · C · 1.5h · Files:** `components/WhatIfPanel.tsx` · §7.8
- A "Have another one now?" button and a drink picker (standard coffee, tea, energy drink). Calls `/whatif` and shows "+9 min to fall asleep (4–17)" with the new curve overlaid. Shows a cap warning when needed.
- **Done when:** it works end to end in mock mode.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

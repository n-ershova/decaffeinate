# F9 · `UsualSuggestions`

> "Your usual?" shortcuts based on what the user normally drinks at this time of day.

**Should · C · 1h · Files:** `components/UsualSuggestions.tsx`
- From recent drinks, show the top 3 by frequency, weighted towards the current hour ±2 h.
- **Done when:** a pure helper function is unit-tested and the preview page renders.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

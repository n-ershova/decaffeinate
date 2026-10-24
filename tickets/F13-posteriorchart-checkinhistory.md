# F13 · `PosteriorChart` + `CheckinHistory`

**Should · C · 2h · Files:** `components/PosteriorChart.tsx`, `components/CheckinHistory.tsx`
- A band chart of the h mean and 80% interval narrowing night by night, a small density plot of the current posterior, and a list of past check-ins.
- **Done when:** the preview page renders the 21-night fixture.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

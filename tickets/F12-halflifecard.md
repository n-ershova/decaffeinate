# F12 · `HalfLifeCard`

**Should · C · 1h · Files:** `components/HalfLifeCard.tsx`
- "Your half-life: 7.1 h (± 1.0)" against the population average of 5 h, the sensitivity label, and a "Not medical advice" footnote.
- **Done when:** the preview page renders the fixture profile.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

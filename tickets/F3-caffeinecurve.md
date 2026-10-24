# F3 · `CaffeineCurve`

**Must · C · 2h · Files:** `components/CaffeineCurve.tsx` · §5.2 Today
- A Recharts area chart from now to the next morning, with a bedtime reference line, a dashed safe line, and an optional dashed `compareCurve` overlay for what-if.
- **Done when:** the preview page shows both the normal and comparison modes.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

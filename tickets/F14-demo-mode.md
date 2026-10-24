# F14 · Demo mode

> The hidden demo screen comparing two simulated users with the same habits but different half-lives.

**Must · A · 2h · Files:** `components/DemoSwitcher.tsx` · §5.2 Demo, §15 step 4
- A "Seed demo" button calls `/demo/seed`. Side by side for users 2 and 3: the two cutoffs, the `PosteriorChart` history animated night by night (slider or play button), and a "Simulated data" badge.
- Inline its own minimal chart; don't import F13.
- **Done when:** in mock mode you can see the two posteriors separate.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

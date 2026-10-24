# F1 · API client + mock mode

> The frontend's connection to the backend, with a mock mode so screens work without the server.

**Must · C · 1.5h · Files:** `lib/api.ts`, `lib/fixtures.ts`
- Typed functions for every route in 0.4. When `NEXT_PUBLIC_MOCK=1`, they return fixtures after a 300 ms delay. The fixtures are a realistic day: a curve, an amber state, and a profile with 21 nights.
- A `useApi` hook (SWR-style) that revalidates `/state` after any write.
- **Done when:** every function has a fixture, and the whole app runs with the backend switched off.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

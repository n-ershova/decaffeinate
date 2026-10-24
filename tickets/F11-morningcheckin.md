# F11 · `MorningCheckin`

**Should · C · 1.5h · Files:** `components/MorningCheckin.tsx` · §5.3
- A modal showing when `/sleep/pending` returns true: bedtime picker, a latency slider (0–120 minutes) and rested 1–5. Saving it refreshes the state.
- **Done when:** it works in mock mode and can be skipped.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

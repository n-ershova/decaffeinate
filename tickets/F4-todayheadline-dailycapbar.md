# F4 · `TodayHeadline` + `DailyCapBar`

**Must · C · 1h · Files:** `components/TodayHeadline.tsx`, `components/DailyCapBar.tsx`
- A large headline coloured by the LED colour. A progress bar against 400 mg that turns red at the cap.
- **Done when:** all three colours, the `null` cutoff and the at-cap state render.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

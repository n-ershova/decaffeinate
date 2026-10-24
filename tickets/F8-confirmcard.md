# F8 · `ConfirmCard`

> The card that confirms a recognised drink, with one-tap fixes for shots, size and decaf.

**Must · C · 2h · Files:** `components/ConfirmCard.tsx` · §6.4
- Shows the drink, mg and range. One-tap chips appear only for the items in `estimate.needs` (single/double, decaf, S/M/L) and recalculate mg on the client using the per-shot rule. If `logged` is set, it shows an "Undo" option instead.
- **Done when:** it handles auto-accepted, needs-shots and unknown results.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

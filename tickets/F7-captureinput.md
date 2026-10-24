# F7 · `CaptureInput`

**Must · C · 1.5h · Files:** `components/CaptureInput.tsx`
- `<input type="file" accept="image/*" capture="environment">` plus a text box. Downscales the image on the client, posts it to `/drinks/identify`, and shows a loading state. A timeout falls back to the message "Pick a preset".
- **Done when:** the image and text paths work in mock mode.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

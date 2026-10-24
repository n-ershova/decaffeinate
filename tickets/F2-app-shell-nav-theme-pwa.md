# F2 · App shell, nav, theme, PWA

> The app's frame: navigation, colours, phone and desktop layouts, and installing it as a web app.

**Must · C · 1.5h · Files:** `components/AppShell.tsx`, `public/manifest.json`, `public/icons/*`, `app/globals.css`
- Bottom tab bar (Today / Log / You) on phones, side nav on desktop, and a red/amber/green colour scale. The manifest makes the app installable.
- A hidden demo toggle: long-press the logo to go to `/demo`.
- **Done when:** it looks right at 375 px and 1280 px, and Lighthouse reports the app as installable.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

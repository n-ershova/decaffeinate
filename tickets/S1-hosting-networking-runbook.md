# S1 · Hosting & networking runbook

**Should · D · 1.5h · Files:** `docs/RUNBOOK.md`, `deploy/` · §10, §16
- Phone hotspot setup and how to find the laptop's IP for the Jetson and the phone. Running locally with `REPO=memory` as a fallback. Optional Vultr deploy with a public URL (systemd or Docker for the API, static Next.js build).
- **Done when:** a teammate can follow it from scratch in 10 minutes.

## Track note

Every Jetson module except H3 must also run on a laptop (with a webcam, and GPIO mocked when `Jetson.GPIO` won't import).

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

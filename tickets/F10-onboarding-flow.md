# F10 · Onboarding flow

**Must · C · 1.5h · Files:** `components/OnboardingFlow.tsx` · §5.1, §17
- Three steps (bedtime, smoker, contraception) plus a safety gate: anyone pregnant, under 18 or with a heart condition is told to follow medical advice.
- **Done when:** completing it calls `POST /users` and stores `user_id` in localStorage.

## Track note

All components follow 0.5. Every ticket also owns `frontend/app/dev/<component>/page.tsx`, a preview page with fixture props, so it can be built and checked without the backend.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

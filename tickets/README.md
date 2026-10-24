# Halflife — Ticket Board

Tickets for the OxHack 2026 MVP, taken from [`halflife-whitepaper.md`](../halflife-whitepaper.md) (section numbers below are written as §).

## How the tickets stay independent

1. **One kickoff ticket (T00)** puts the shared **contracts** (types, function signatures, API JSON, component props) and **stub files** into the repo. It is the only ticket the others build on. Do it together in the first ~45 minutes, then split up.
2. **Each ticket owns its own files.** No two tickets edit the same file, so merges don't conflict. If you need to change a file someone else owns, ask the owner. Don't edit it yourself.
3. **Dependencies are passed in, not imported.** Model functions take an `exposure_fn` argument instead of importing `curve.py`, routes take the engine as a FastAPI dependency, and React components take props. Every ticket can be built and tested against fakes or fixtures, even before any other ticket is done.
4. **The contracts are frozen.** Changing one means telling all 4 people at once and updating [Section 0](00-CONTRACTS.md).

> If T00 isn't merged when you start, paste the contract files from [Section 0](00-CONTRACTS.md) locally, word for word. If two branches add a file with identical content, git merges it cleanly.

### Owners

| Person | Track | Tickets |
|---|---|---|
| **A** | Model, engine & demo mode | M1–M10, E1, F14 |
| **B** | Data, logging & API | D1–D9, E2, E3 |
| **C** | Frontend | F1–F13, F15 |
| **D** | Hardware, sponsors & ship | H1–H8, S1–S4 |

For which ticket owns each component and file, see [OWNERSHIP.md](OWNERSHIP.md).

Work top to bottom within your list. **Must** before **Should** before **Could**.

---

## Board

| ID | Title | Pri | Owner | Est |
|---|---|---|---|---|
| [T00](T00-scaffold-freeze-contracts.md) | Scaffold & freeze contracts | Must | All | 45m |
| [M1](M1-caffeine-curve-closed-form-sleep-exposure.md) | Caffeine curve & closed-form sleep exposure | Must | A | 1.5h |
| [M2](M2-priors-from-onboarding.md) | Priors from onboarding | Must | A | 1h |
| [M3](M3-grid-posterior.md) | Grid posterior (Bayesian linear regression over h grid) | Must | A | 3h |
| [M4](M4-posterior-sampling-plain-language-summary.md) | Posterior sampling & plain-language summary | Must | A | 1h |
| [M5](M5-cutoff-time-decision.md) | Cutoff time decision | Must | A | 1.5h |
| [M6](M6-what-if-prediction.md) | What-if prediction | Must | A | 1h |
| [M7](M7-led-state-rule-daily-cap-safe-line.md) | LED state rule, daily cap & safe line | Must | A | 1h |
| [M8](M8-simulator.md) | Simulator (synthetic users) | Must | A | 2h |
| [M9](M9-experiment-day-suggestions.md) | Experiment day suggestions | Could | A | 1.5h |
| [M10](M10-plan-my-day.md) | Plan my day | Could | A | 2h |
| [E1](E1-engine-service.md) | Engine service (wires model to repo) | Must | A | 2h |
| [E2](E2-state-and-whatif-routes.md) | `/state` and `/whatif` routes | Must | B | 1h |
| [E3](E3-profile-route.md) | `/profile` route with night-by-night history | Should | B | 1.5h |
| [D1](D1-drink-lookup-table-estimator.md) | Drink lookup table & estimator | Must | B | 2h |
| [D2](D2-gemini-client.md) | Gemini client with schema-constrained output | Must | B | 2.5h |
| [D3](D3-tiger-data-schema-setup.md) | Tiger Data schema & setup script | Must | B | 1.5h |
| [D4](D4-tigerrepo.md) | `TigerRepo` (Postgres implementation of `Repo`) | Must | B | 2.5h |
| [D5](D5-memoryrepo.md) | `MemoryRepo` (in-memory implementation of `Repo`) | Must | B | 1h |
| [D6](D6-drinksidentify-route.md) | `/drinks/identify` route | Must | B | 1.5h |
| [D7](D7-logging-routes.md) | Logging routes: `/drinks`, `/alcohol`, `/sleep`, `/presets` | Must | B | 1.5h |
| [D8](D8-users-routes.md) | `/users` routes (onboarding & settings) | Must | B | 1h |
| [D9](D9-demoseed-route-seed-sql.md) | `/demo/seed` route & `seed_demo.sql` | Must | B | 1.5h |
| [F1](F1-api-client-mock-mode.md) | API client + mock mode with fixtures | Must | C | 1.5h |
| [F2](F2-app-shell-nav-theme-pwa.md) | App shell, nav, theme, PWA manifest | Must | C | 1.5h |
| [F3](F3-caffeinecurve.md) | `CaffeineCurve` chart | Must | C | 2h |
| [F4](F4-todayheadline-dailycapbar.md) | `TodayHeadline` + `DailyCapBar` | Must | C | 1h |
| [F5](F5-whatifpanel.md) | `WhatIfPanel` | Must | C | 1.5h |
| [F6](F6-presetgrid-alcoholquickadd.md) | `PresetGrid` + `AlcoholQuickAdd` | Must | C | 1.5h |
| [F7](F7-captureinput.md) | `CaptureInput` (camera + text) | Must | C | 1.5h |
| [F8](F8-confirmcard.md) | `ConfirmCard` with one-tap corrections | Must | C | 2h |
| [F9](F9-usualsuggestions.md) | `UsualSuggestions` ("Your usual?") | Should | C | 1h |
| [F10](F10-onboarding-flow.md) | Onboarding flow | Must | C | 1.5h |
| [F11](F11-morningcheckin.md) | `MorningCheckin` modal | Should | C | 1.5h |
| [F12](F12-halflifecard.md) | `HalfLifeCard` + sensitivity text | Should | C | 1h |
| [F13](F13-posteriorchart-checkinhistory.md) | `PosteriorChart` + `CheckinHistory` | Should | C | 2h |
| [F14](F14-demo-mode.md) | Demo mode toggle & two-user comparison | Must | A | 2h |
| [F15](F15-settings-safety.md) | Settings (tolerance) & safety page | Should | C | 1h |
| [H1](H1-rgb-led-driver.md) | RGB LED driver | Should | D | 1h |
| [H2](H2-led-state-loop.md) | LED state loop (polls `/state`) | Should | D | 1h |
| [H3](H3-yolo-nano-tensorrt-detector.md) | YOLO nano → TensorRT detector | Should | D | 3h |
| [H4](H4-trigger-logic.md) | Trigger logic (centre zone, stable 1s, cooldown) | Should | D | 1.5h |
| [H5](H5-crop-upload-client.md) | Crop & upload client | Should | D | 1h |
| [H6](H6-button-capture-fallback.md) | Button-capture fallback | Should | D | 1h |
| [H7](H7-scan-station-py-orchestrator.md) | `scan_station.py` orchestrator | Should | D | 1h |
| [H8](H8-enclosure-wiring.md) | Enclosure & wiring | Should | D | 2h |
| [S1](S1-hosting-networking-runbook.md) | Hosting & networking runbook (hotspot, Vultr) | Should | D | 1.5h |
| [S2](S2-presage-heart-rate-check.md) | Presage heart rate check (`/hr` + scan page) | Could | D | 2.5h |
| [S3](S3-elevenlabs-morning-brief.md) | ElevenLabs spoken morning brief (`/brief`) | Could | D | 1.5h |
| [S4](S4-devpost-write-up-demo-plan.md) | Devpost write-up, screenshots, demo video plan | Must | D | 2h |

---

## Integration checkpoints (not tickets: everyone, 10 min each)

| When (§14.2) | Check |
|---|---|
| Sat evening | `REPO=memory make api` + `make web`: log a preset, the curve updates, the cutoff shows |
| Midnight | Jetson go/no-go (H3/H4) or switch to H6. The LED is driven by real `/state` |
| Sun morning | Feature freeze. `REPO=tiger`, seed the demo, 3 full rehearsals |

# Component Ownership

This file shows which ticket builds each component. Each file has exactly one owner. To change a file you don't own, ask its owner.
Tickets: [README.md](README.md). Contracts: [00-CONTRACTS.md](00-CONTRACTS.md).

Owners: **A** model, engine & demo mode · **B** data, logging & API · **C** frontend · **D** hardware, sponsors & ship

## Shared scaffold (T00 · All)

| Component | Files |
|---|---|
| FastAPI app & router auto-include | `backend/app/main.py` |
| Shared types | `backend/app/types.py` |
| Dependencies (repo, engine, clock) | `backend/app/deps.py` |
| Repo interface | `backend/app/db/repo.py` |
| Pages (compose stubs) | `frontend/app/{page,log,you,onboarding,settings,demo}/…` |
| Frontend types | `frontend/lib/types.ts` |
| Tooling | `requirements.txt`, `.env.example`, `Makefile` |

## Backend: model (`backend/app/model/`)

| Component | Files | Ticket | Owner |
|---|---|---|---|
| Caffeine curve & sleep exposure | `curve.py` | [M1](M1-caffeine-curve-closed-form-sleep-exposure.md) | A |
| Priors | `priors.py` | [M2](M2-priors-from-onboarding.md) | A |
| Grid posterior | `posterior.py` | [M3](M3-grid-posterior.md) | A |
| Sampling & summary | `sampling.py` | [M4](M4-posterior-sampling-plain-language-summary.md) | A |
| Cutoff time | `decisions.py` | [M5](M5-cutoff-time-decision.md) | A |
| What-if | `whatif.py` | [M6](M6-what-if-prediction.md) | A |
| LED rule, cap, safe line | `led.py` | [M7](M7-led-state-rule-daily-cap-safe-line.md) | A |
| Simulator | `simulate.py` | [M8](M8-simulator.md) | A |
| Experiment days | `experiment.py` | [M9](M9-experiment-day-suggestions.md) | A |
| Plan my day | `plan.py` | [M10](M10-plan-my-day.md) | A |

## Backend: services, drinks, database (`backend/app/`)

| Component | Files | Ticket | Owner |
|---|---|---|---|
| Engine (wires model to repo) | `services/engine.py` | [E1](E1-engine-service.md) | A |
| Drink lookup table & estimator | `drinks/lookup.py`, `data/drinks.json` | [D1](D1-drink-lookup-table-estimator.md) | B |
| Gemini client | `drinks/gemini.py`, `data/gemini_cache/` | [D2](D2-gemini-client.md) | B |
| Tiger Data schema | `db/schema.sql`, `scripts/db_setup.sh` | [D3](D3-tiger-data-schema-setup.md) | B |
| Postgres repo | `db/tiger_repo.py` | [D4](D4-tigerrepo.md) | B |
| In-memory repo | `db/memory_repo.py` | [D5](D5-memoryrepo.md) | B |

## Backend: API routes (`backend/app/routes/`)

| Route(s) | File | Ticket | Owner |
|---|---|---|---|
| `GET /state`, `POST /whatif` | `state.py` | [E2](E2-state-and-whatif-routes.md) | B |
| `GET /profile` | `profile.py` | [E3](E3-profile-route.md) | B |
| `POST /drinks/identify` | `identify.py` | [D6](D6-drinksidentify-route.md) | B |
| `/drinks`, `/alcohol`, `/sleep`, `/sleep/pending`, `/presets` | `logging.py` | [D7](D7-logging-routes.md) | B |
| `/users`, `/users/{id}` | `users.py` | [D8](D8-users-routes.md) | B |
| `POST /demo/seed` | `demo.py`, `data/seed_demo.sql` | [D9](D9-demoseed-route-seed-sql.md) | B |
| `POST /hr` | `hr.py` | [S2](S2-presage-heart-rate-check.md) | D |
| `GET /brief` | `brief.py` | [S3](S3-elevenlabs-morning-brief.md) | D |

Tests: `backend/tests/test_<file>.py` belongs to the ticket that owns `<file>`.

## Frontend (`frontend/`)

| Component | Files | Screen | Ticket | Owner |
|---|---|---|---|---|
| API client & mock fixtures | `lib/api.ts`, `lib/fixtures.ts` | all | [F1](F1-api-client-mock-mode.md) | C |
| App shell, nav, theme, PWA | `components/AppShell.tsx`, `app/globals.css`, `public/manifest.json`, `public/icons/*` | layout | [F2](F2-app-shell-nav-theme-pwa.md) | C |
| `CaffeineCurve` | `components/CaffeineCurve.tsx` | Today | [F3](F3-caffeinecurve.md) | C |
| `TodayHeadline`, `DailyCapBar` | `components/TodayHeadline.tsx`, `components/DailyCapBar.tsx` | Today | [F4](F4-todayheadline-dailycapbar.md) | C |
| `WhatIfPanel` | `components/WhatIfPanel.tsx` | Today | [F5](F5-whatifpanel.md) | C |
| `PresetGrid`, `AlcoholQuickAdd` | `components/PresetGrid.tsx`, `components/AlcoholQuickAdd.tsx` | Log | [F6](F6-presetgrid-alcoholquickadd.md) | C |
| `CaptureInput` | `components/CaptureInput.tsx` | Log | [F7](F7-captureinput.md) | C |
| `ConfirmCard` | `components/ConfirmCard.tsx` | Log | [F8](F8-confirmcard.md) | C |
| `UsualSuggestions` | `components/UsualSuggestions.tsx` | Log | [F9](F9-usualsuggestions.md) | C |
| `OnboardingFlow` | `components/OnboardingFlow.tsx` | Onboarding | [F10](F10-onboarding-flow.md) | C |
| `MorningCheckin` | `components/MorningCheckin.tsx` | layout | [F11](F11-morningcheckin.md) | C |
| `HalfLifeCard` | `components/HalfLifeCard.tsx` | You | [F12](F12-halflifecard.md) | C |
| `PosteriorChart`, `CheckinHistory` | `components/PosteriorChart.tsx`, `components/CheckinHistory.tsx` | You | [F13](F13-posteriorchart-checkinhistory.md) | C |
| `DemoSwitcher` | `components/DemoSwitcher.tsx` | Demo | [F14](F14-demo-mode.md) | A |
| `SettingsForm`, `SafetyNotice` | `components/SettingsForm.tsx`, `components/SafetyNotice.tsx` | Settings | [F15](F15-settings-safety.md) | C |
| Heart rate scan page | `app/hr/page.tsx` | HR | [S2](S2-presage-heart-rate-check.md) | D |

Preview pages: `frontend/app/dev/<component>/page.tsx` belongs to the ticket that owns `<component>`.

## Jetson scan station (`jetson/`)

| Component | Files | Ticket | Owner |
|---|---|---|---|
| RGB LED driver | `led.py` | [H1](H1-rgb-led-driver.md) | D |
| LED state loop | `state_loop.py` | [H2](H2-led-state-loop.md) | D |
| YOLO / TensorRT detector | `detector.py`, `export_engine.sh` | [H3](H3-yolo-nano-tensorrt-detector.md) | D |
| Trigger logic | `trigger.py` | [H4](H4-trigger-logic.md) | D |
| Crop & upload | `uploader.py` | [H5](H5-crop-upload-client.md) | D |
| Button-capture fallback | `button_capture.py` | [H6](H6-button-capture-fallback.md) | D |
| Orchestrator | `scan_station.py` | [H7](H7-scan-station-py-orchestrator.md) | D |
| Enclosure & wiring | physical build | [H8](H8-enclosure-wiring.md) | D |

Tests: `jetson/tests/test_<file>.py` belongs to the ticket that owns `<file>`.

## Docs & deployment

| Component | Files | Ticket | Owner |
|---|---|---|---|
| Hosting & networking runbook | `docs/RUNBOOK.md`, `deploy/` | [S1](S1-hosting-networking-runbook.md) | D |
| Devpost write-up & demo script | `docs/DEVPOST.md`, `docs/DEMO.md` | [S4](S4-devpost-write-up-demo-plan.md) | D |

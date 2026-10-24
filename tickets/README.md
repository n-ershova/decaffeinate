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

| ID | Title | Description | Pri | Owner | Est |
|---|---|---|---|---|---|
| [T00](T00-scaffold-freeze-contracts.md) | Scaffold & freeze contracts | Set up the empty project and the shared contracts so all four people can build in parallel from the start. | Must | All | 45m |
| [M1](M1-caffeine-curve-closed-form-sleep-exposure.md) | Caffeine curve & closed-form sleep exposure | Calculate how much caffeine is in the body at any time, and the average amount during the first 3 hours of sleep. | Must | A | 1.5h |
| [M2](M2-priors-from-onboarding.md) | Priors from onboarding | Turn the onboarding answers (smoking, contraception) into the starting guess for the user's half-life. | Must | A | 1h |
| [M3](M3-grid-posterior.md) | Grid posterior (Bayesian linear regression over h grid) | The core learning step: update the estimate of half-life and sensitivity from logged drinks and reported sleep. | Must | A | 3h |
| [M4](M4-posterior-sampling-plain-language-summary.md) | Posterior sampling & plain-language summary | Draw samples from the learned estimate and describe it in plain language ("7.1 h ± 1.0", "Average sensitivity"). | Must | A | 1h |
| [M5](M5-cutoff-time-decision.md) | Cutoff time decision | Work out the latest time today the user can have a standard coffee and still sleep well. | Must | A | 1.5h |
| [M6](M6-what-if-prediction.md) | What-if prediction | Predict how many extra minutes it will take to fall asleep if the user has a given drink now. | Must | A | 1h |
| [M7](M7-led-state-rule-daily-cap-safe-line.md) | LED state rule, daily cap & safe line | Decide the green, amber or red light, enforce the 400 mg daily cap, and compute the sleep-safe line on the chart. | Must | A | 1h |
| [M8](M8-simulator.md) | Simulator (synthetic users) | Generate fake users with known half-lives and 21 days of history, so the demo can show the model learning. | Must | A | 2h |
| [M9](M9-experiment-day-suggestions.md) | Experiment day suggestions | Suggest a drink time that would teach the model the most without risking a bad night. (Stretch) | Could | A | 1.5h |
| [M10](M10-plan-my-day.md) | Plan my day | Plan drink times to be most alert at a chosen time while still sleeping well. (Stretch) | Could | A | 2h |
| [E1](E1-engine-service.md) | Engine service (wires model to repo) | Connect the model pieces to the stored data and produce the numbers each screen shows. | Must | A | 2h |
| [E2](E2-state-and-whatif-routes.md) | `/state` and `/whatif` routes | API endpoints for the Today screen: the current caffeine state and the what-if prediction. | Must | B | 1h |
| [E3](E3-profile-route.md) | `/profile` route with night-by-night history | API endpoint for the You screen: the half-life estimate and how it narrowed night by night. | Should | B | 1.5h |
| [D1](D1-drink-lookup-table-estimator.md) | Drink lookup table & estimator | The table of drinks and their caffeine, plus the rules that turn a recognised drink into a milligram estimate. | Must | B | 2h |
| [D2](D2-gemini-client.md) | Gemini client with schema-constrained output | Send a photo or text to Gemini and get back which drink it is, never a guessed caffeine number. | Must | B | 2.5h |
| [D3](D3-tiger-data-schema-setup.md) | Tiger Data schema & setup script | Create the Tiger Data database tables for drinks, alcohol, sleep and heart rate, plus the daily totals view. | Must | B | 1.5h |
| [D4](D4-tigerrepo.md) | `TigerRepo` (Postgres implementation of `Repo`) | Read and write all app data in Tiger Data (Postgres). | Must | B | 2.5h |
| [D5](D5-memoryrepo.md) | `MemoryRepo` (in-memory implementation of `Repo`) | An in-memory stand-in for the database, used for tests and as an offline demo fallback. | Must | B | 1h |
| [D6](D6-drinksidentify-route.md) | `/drinks/identify` route | API endpoint that takes a photo or description, identifies the drink and logs it automatically when confident. | Must | B | 1.5h |
| [D7](D7-logging-routes.md) | Logging routes: `/drinks`, `/alcohol`, `/sleep`, `/presets` | API endpoints to save drinks, alcohol and morning check-ins, and to list presets and recent drinks. | Must | B | 1.5h |
| [D8](D8-users-routes.md) | `/users` routes (onboarding & settings) | API endpoints to create a user from onboarding and update their bedtime and tolerance. | Must | B | 1h |
| [D9](D9-demoseed-route-seed-sql.md) | `/demo/seed` route & `seed_demo.sql` | API endpoint that creates the two simulated demo users (fast and slow) with three weeks of history. | Must | B | 1.5h |
| [F1](F1-api-client-mock-mode.md) | API client + mock mode with fixtures | The frontend's connection to the backend, with a mock mode so screens work without the server. | Must | C | 1.5h |
| [F2](F2-app-shell-nav-theme-pwa.md) | App shell, nav, theme, PWA manifest | The app's frame: navigation, colours, phone and desktop layouts, and installing it as a web app. | Must | C | 1.5h |
| [F3](F3-caffeinecurve.md) | `CaffeineCurve` chart | The main chart showing caffeine in the body from now until tomorrow morning, with bedtime and the safe line. | Must | C | 2h |
| [F4](F4-todayheadline-dailycapbar.md) | `TodayHeadline` + `DailyCapBar` | The headline ("Last coffee today by 14:10") in red, amber or green, and a progress bar towards the 400 mg cap. | Must | C | 1h |
| [F5](F5-whatifpanel.md) | `WhatIfPanel` | The "Have another one now?" button showing how a drink would change tonight's sleep. | Must | C | 1.5h |
| [F6](F6-presetgrid-alcoholquickadd.md) | `PresetGrid` + `AlcoholQuickAdd` | Quick-tap tiles for common drinks, plus buttons for logging alcohol. | Must | C | 1.5h |
| [F7](F7-captureinput.md) | `CaptureInput` (camera + text) | Take a photo or type a description of a drink and send it for recognition. | Must | C | 1.5h |
| [F8](F8-confirmcard.md) | `ConfirmCard` with one-tap corrections | The card that confirms a recognised drink, with one-tap fixes for shots, size and decaf. | Must | C | 2h |
| [F9](F9-usualsuggestions.md) | `UsualSuggestions` ("Your usual?") | "Your usual?" shortcuts based on what the user normally drinks at this time of day. | Should | C | 1h |
| [F10](F10-onboarding-flow.md) | Onboarding flow | The three first-run questions (bedtime, smoking, contraception) plus a safety check. | Must | C | 1.5h |
| [F11](F11-morningcheckin.md) | `MorningCheckin` modal | The morning pop-up asking when the user went to bed and how long it took to fall asleep. | Should | C | 1.5h |
| [F12](F12-halflifecard.md) | `HalfLifeCard` + sensitivity text | Shows the user's personal half-life and sensitivity compared with the average person. | Should | C | 1h |
| [F13](F13-posteriorchart-checkinhistory.md) | `PosteriorChart` + `CheckinHistory` | Charts showing the half-life estimate narrowing over time, plus a list of past check-ins. | Should | C | 2h |
| [F14](F14-demo-mode.md) | Demo mode toggle & two-user comparison | The hidden demo screen comparing two simulated users with the same habits but different half-lives. | Must | A | 2h |
| [F15](F15-settings-safety.md) | Settings (tolerance) & safety page | Settings for tolerance and bedtime, plus the safety and not-medical-advice information. | Should | C | 1h |
| [H1](H1-rgb-led-driver.md) | RGB LED driver | Control the red, amber and green LED on the Jetson. | Should | D | 1h |
| [H2](H2-led-state-loop.md) | LED state loop (polls `/state`) | Keep the LED in sync with the app by checking the backend every 2 seconds. | Should | D | 1h |
| [H3](H3-yolo-nano-tensorrt-detector.md) | YOLO nano → TensorRT detector | Run a fast on-device model that spots cups and bottles in the webcam feed. | Should | D | 3h |
| [H4](H4-trigger-logic.md) | Trigger logic (centre zone, stable 1s, cooldown) | Decide when a drink is being deliberately held up to the camera, and avoid double logging. | Should | D | 1.5h |
| [H5](H5-crop-upload-client.md) | Crop & upload client | Crop just the drink from the frame and send it to the backend (faces never leave the device). | Should | D | 1h |
| [H6](H6-button-capture-fallback.md) | Button-capture fallback | Backup mode: press a button to snap and send one photo if automatic detection is unreliable. | Should | D | 1h |
| [H7](H7-scan-station-py-orchestrator.md) | `scan_station.py` orchestrator | The main Jetson program that ties the camera, detection, upload and LED together. | Should | D | 1h |
| [H8](H8-enclosure-wiring.md) | Enclosure & wiring | Wire the LED and build the cardboard enclosure for the desk device. | Should | D | 2h |
| [S1](S1-hosting-networking-runbook.md) | Hosting & networking runbook (hotspot, Vultr) | Step-by-step guide to running the demo on a phone hotspot, with optional Vultr hosting. | Should | D | 1.5h |
| [S2](S2-presage-heart-rate-check.md) | Presage heart rate check (`/hr` + scan page) | A 30-second camera heart rate scan after a drink, using Presage. (Stretch) | Could | D | 2.5h |
| [S3](S3-elevenlabs-morning-brief.md) | ElevenLabs spoken morning brief (`/brief`) | A spoken morning summary of today's caffeine advice, using ElevenLabs. (Stretch) | Could | D | 1.5h |
| [S4](S4-devpost-write-up-demo-plan.md) | Devpost write-up, screenshots, demo video plan | The Devpost write-up, screenshots and a rehearsed demo script with fallbacks. | Must | D | 2h |

---

## Integration checkpoints (not tickets: everyone, 10 min each)

| When (§14.2) | Check |
|---|---|
| Sat evening | `REPO=memory make api` + `make web`: log a preset, the curve updates, the cutoff shows |
| Midnight | Jetson go/no-go (H3/H4) or switch to H6. The LED is driven by real `/state` |
| Sun morning | Feature freeze. `REPO=tiger`, seed the demo, 3 full rehearsals |

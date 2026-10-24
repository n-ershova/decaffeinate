# Section 0 — Frozen contracts (written in T00)

## 0.1 Repo layout

The flat `main.py / model.py / drinks.py` layout in §10.1 is split into one file per ticket:

```
backend/
  app/
    main.py                  T00  auto-includes every router in app/routes/
    types.py                 T00  shared pydantic models (0.2)
    deps.py                  T00  get_repo(), get_engine(), get_now() FastAPI dependencies
    model/
      curve.py      M1   priors.py   M2   posterior.py  M3   sampling.py  M4
      decisions.py  M5   whatif.py   M6   led.py        M7   simulate.py  M8
      experiment.py M9   plan.py     M10
    services/engine.py       E1
    drinks/lookup.py         D1
    drinks/gemini.py         D2
    db/repo.py               T00  Repo Protocol
    db/memory_repo.py        D5
    db/tiger_repo.py         D4
    db/schema.sql            D3
    routes/
      state.py  E2   profile.py E3   identify.py D6   logging.py D7
      users.py  D8   demo.py    D9   hr.py       S2   brief.py   S3
  tests/                     test_<file>.py owned by the ticket that owns <file>
frontend/
  app/                       T00 pages: /, /log, /you, /onboarding, /settings, /demo
  components/                T00 stubs; one component file per ticket (0.5)
  lib/types.ts               T00  mirrors 0.4
  lib/api.ts                 F1
  lib/fixtures.ts            F1
jetson/
  led.py H1   state_loop.py H2   detector.py H3   trigger.py H4
  uploader.py H5   button_capture.py H6   scan_station.py H7
data/
  drinks.json                D1
  seed_demo.sql              D9
```

Ports: backend `:8000`, frontend `:3000`. Env: `REPO=memory|tiger`, `DATABASE_URL`, `GEMINI_API_KEY`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MOCK=1`, `HALFLIFE_API` (Jetson).

There are no accounts (§4 out of scope). Every endpoint takes `user_id`, defaulting to `1`. Simulated demo users get ids `2` and `3`.

## 0.2 Python types (`backend/app/types.py`)

```python
from datetime import datetime, date, time
from typing import Literal, Callable
from pydantic import BaseModel
import numpy as np

Source = Literal["preset", "photo", "text", "jetson", "simulated"]
Led = Literal["green", "amber", "red"]
DRINK_KEYS = [  # §6.5, plus "unknown"
    "espresso_shot", "milk_coffee", "americano", "mocha", "filter_coffee", "cold_brew",
    "instant_coffee", "capsule_coffee", "decaf", "black_tea", "green_tea", "matcha",
    "chai_latte", "yerba_mate", "iced_tea_bottled", "cola", "diet_cola", "red_bull",
    "energy_drink_500", "pre_workout", "hot_chocolate", "herbal_tea", "unknown",
]

class User(BaseModel):
    id: int; name: str; bedtime: time; smoker: bool; hormonal_bc: bool
    tolerance_min: int = 10; is_simulated: bool = False

class Drink(BaseModel):
    time: datetime; user_id: int; drink_key: str
    mg: float; mg_low: float; mg_high: float; source: Source

class Alcohol(BaseModel):
    time: datetime; user_id: int; units: float

class SleepNight(BaseModel):
    night: date; user_id: int; bedtime: datetime
    latency_min: float; rested_1to5: int | None = None

class HrCheck(BaseModel):
    time: datetime; user_id: int; drink_time: datetime | None; hr_bpm: float; br_bpm: float

class GeminiResult(BaseModel):          # §6.3
    drink: str                          # one of DRINK_KEYS
    size: Literal["small", "regular", "large"] | None = None
    shots: int | None = None
    brand: str | None = None
    decaf: bool = False
    label_mg: float | None = None
    confidence: float

class DrinkEstimate(BaseModel):
    drink_key: str; label: str; mg: float; mg_low: float; mg_high: float
    needs: list[Literal["shots", "decaf", "size"]]   # clarifying questions, §6.4
    auto_accept: bool

class Preset(BaseModel):
    key: str; label: str; mg: float; mg_low: float; mg_high: float; emoji: str

class Prior(BaseModel, arbitrary_types_allowed=True):
    log_h_mean: float; log_h_sd: float
    m0: np.ndarray       # (3,)  prior mean of w = (mu, beta, gamma)
    S0: np.ndarray       # (3,3) prior covariance

class Posterior(BaseModel, arbitrary_types_allowed=True):
    h_grid: np.ndarray   # (G,)
    h_prob: np.ndarray   # (G,) sums to 1
    m_N: np.ndarray      # (G,3)
    S_N: np.ndarray      # (G,3,3)

class PosteriorSummary(BaseModel):
    h_mean: float; h_sd: float; h_ci80: tuple[float, float]
    beta_mean: float; beta_sd: float; sensitivity_label: str

class WhatIf(BaseModel):
    median_min: float; low_min: float; high_min: float   # extra latency, 10th..90th pct

class SimHistory(BaseModel):
    user: User; true_h: float; true_beta: float
    drinks: list[Drink]; alcohol: list[Alcohol]; nights: list[SleepNight]

# Samples are np.ndarray of shape (n, 4): columns h, mu, beta, gamma.
# Exposure function: E(drinks, bedtime, h) -> mean mg over [bedtime, bedtime+3h]  (§7.3)
ExposureFn = Callable[[list[Drink], datetime, float], float]
# Amount function: C(drinks, t, h) -> mg in body at time t  (§7.2)
AmountFn = Callable[[list[Drink], datetime, float], float]
```

## 0.3 Python function signatures (stubbed in T00, filled by the owning ticket)

```python
# model/curve.py (M1)
def amount_at(drinks: list[Drink], t: datetime, h: float) -> float
def curve(drinks: list[Drink], start: datetime, end: datetime, h: float, step_min: int = 15) -> list[tuple[datetime, float]]
def sleep_exposure(drinks: list[Drink], bedtime: datetime, h: float, window_h: float = 3.0) -> float

# model/priors.py (M2)
def make_prior(user: User) -> Prior
def log_prior_h(h_grid: np.ndarray, prior: Prior) -> np.ndarray

# model/posterior.py (M3)
H_GRID = np.geomspace(1.5, 15, 200)
def fit(prior: Prior, exposures: Callable[[float], np.ndarray], alcohol_units: np.ndarray,
        latencies: np.ndarray, sigma: float = 12.0) -> Posterior
    # exposures(h) -> E_n in mg for each night n (same order as latencies)

# model/sampling.py (M4)
def sample(post: Posterior, n: int, rng: np.random.Generator) -> np.ndarray   # (n,4), beta clipped >= 0
def summarize(post: Posterior) -> PosteriorSummary

# model/decisions.py (M5)
def cutoff(samples, today: list[Drink], now: datetime, bedtime: datetime, delta_min: float,
           exposure_fn: ExposureFn, std_mg: float = 130, quantile: float = 0.2) -> datetime | None

# model/whatif.py (M6)
def whatif(samples, today: list[Drink], proposed: Drink, bedtime: datetime,
           exposure_fn: ExposureFn) -> WhatIf

# model/led.py (M7)
CAP_MG = 400
def led_state(samples, today: list[Drink], now: datetime, bedtime: datetime, delta_min: float,
              daily_total_mg: float, exposure_fn: ExposureFn) -> Led
def safe_line_mg(samples, delta_min: float) -> float

# model/simulate.py (M8)
def simulate_user(user: User, true_h: float, true_beta: float, start: date, days: int,
                  seed: int, exposure_fn: ExposureFn, mu: float = 15, gamma: float = 8,
                  sigma: float = 12) -> SimHistory

# model/experiment.py (M9)
def suggest_experiment(samples, today, bedtime, candidates: list[datetime], delta_relaxed: float,
                       exposure_fn: ExposureFn) -> datetime | None

# model/plan.py (M10)
def plan_day(samples, wake: datetime, bedtime: datetime, target: datetime, delta_min: float,
             cap_mg: float, exposure_fn: ExposureFn, amount_fn: AmountFn) -> list[Drink]

# services/engine.py (E1). Routes get it through deps.get_engine()
class Engine:
    def __init__(self, repo: "Repo"): ...
    def state(self, user_id: int, now: datetime) -> dict          # JSON of GET /state
    def whatif(self, user_id: int, now: datetime, drink_key: str, mg: float) -> dict  # POST /whatif
    def profile(self, user_id: int, now: datetime) -> dict        # GET /profile

# drinks/lookup.py (D1)
def estimate(result: GeminiResult) -> DrinkEstimate
def presets() -> list[Preset]

# drinks/gemini.py (D2)
def identify_image(jpeg: bytes) -> GeminiResult
def identify_text(text: str) -> GeminiResult

# db/repo.py (T00). D4 and D5 implement this
class Repo(Protocol):
    def create_user(self, u: User) -> User; def get_user(self, id: int) -> User | None
    def update_user(self, id: int, **fields) -> User; def list_users(self) -> list[User]
    def add_drink(self, d: Drink) -> Drink
    def list_drinks(self, user_id: int, start: datetime, end: datetime) -> list[Drink]
    def add_alcohol(self, a: Alcohol) -> Alcohol
    def list_alcohol(self, user_id: int, start: datetime, end: datetime) -> list[Alcohol]
    def upsert_sleep(self, s: SleepNight) -> SleepNight
    def list_sleep(self, user_id: int) -> list[SleepNight]
    def daily_total_mg(self, user_id: int, day: date) -> float
    def add_hr(self, h: HrCheck) -> HrCheck
    def reset_user(self, user_id: int) -> None
```

## 0.4 HTTP API (§12 plus what the screens need)

All times are ISO 8601 with offset. `cutoff` and `bedtime` are `"HH:MM"` local.

| Method | Route | Body / query | Response | Owner |
|---|---|---|---|---|
| GET | `/state` | `?user_id` | `StateResponse` | E2 |
| POST | `/whatif` | `{user_id, drink_key, mg}` | `WhatIfResponse` | E2 |
| GET | `/profile` | `?user_id` | `ProfileResponse` | E3 |
| POST | `/drinks/identify` | multipart: `image` **or** `text`, `source`, `user_id` | `IdentifyResponse` | D6 |
| POST | `/drinks` | `{user_id, drink_key, mg, mg_low, mg_high, source, time?}` | `Drink` | D7 |
| GET | `/drinks` | `?user_id&days=14` | `Drink[]` | D7 |
| POST | `/alcohol` | `{user_id, units, time?}` | `Alcohol` | D7 |
| POST | `/sleep` | `{user_id, night, bedtime, latency_min, rested_1to5}` | `SleepNight` | D7 |
| GET | `/sleep/pending` | `?user_id` | `{needs_checkin: bool, night: date}` | D7 |
| GET | `/presets` | | `Preset[]` | D7 |
| POST | `/users` | `{name, bedtime, smoker, hormonal_bc}` | `User` | D8 |
| GET / PATCH | `/users/{id}` | PATCH `{bedtime?, tolerance_min?}` | `User` | D8 |
| POST | `/demo/seed` | | `{users: [{id, name, true_h}]}` | D9 |
| POST | `/hr` | `{user_id, drink_time, hr_bpm, br_bpm}` | `HrCheck` | S2 |
| GET | `/brief` | `?user_id` | `audio/mpeg` | S3 |

```jsonc
// StateResponse
{ "now_mg": 142, "bedtime": "23:30", "cutoff": "14:10" /* or null */,
  "headline": "Last coffee today by 14:10" /* or "No more caffeine today" */,
  "led": "amber", "daily_total_mg": 195, "cap_mg": 400,
  "curve": [{"t": "2026-10-24T16:00:00+01:00", "mg": 142}],   // now → next 08:00, 15 min steps
  "safe_line_mg": 38, "is_simulated": false }

// WhatIfResponse
{ "extra_latency_min": {"median": 9, "low": 4, "high": 17},
  "curve": [{"t": "...", "mg": 0}], "led_after": "red", "cap_exceeded": false }

// ProfileResponse
{ "half_life": {"mean": 7.1, "sd": 1.0, "ci80": [5.8, 8.4]}, "population_mean_h": 5,
  "sensitivity": {"mean": 6.2, "sd": 2.1, "label": "Average sensitivity"},
  "posterior": {"h_grid": [1.5, "..."], "prob": [0.0, "..."]},
  "history": [{"night": "2026-10-03", "h_mean": 5.0, "h_low": 2.6, "h_high": 9.4}],
  "checkins": [/* SleepNight[] */] }

// IdentifyResponse
{ "gemini": {/* GeminiResult */}, "estimate": {/* DrinkEstimate */},
  "logged": {/* Drink, set when auto_accept */} }
```

## 0.5 Frontend components (`frontend/components/*.tsx`, stubbed in T00)

T00 creates every file below, exporting the named component with the given props and rendering `<div>TODO Name</div>`. T00 also writes the pages, which already compose these stubs, so the page files are finished on day one.

| Component | Props | Used on | Owner |
|---|---|---|---|
| `AppShell` | `{children}` | layout | F2 |
| `CaffeineCurve` | `{curve, bedtime, safeLineMg, compareCurve?}` | `/`, WhatIf | F3 |
| `TodayHeadline` | `{headline, cutoff, led}` | `/` | F4 |
| `DailyCapBar` | `{totalMg, capMg}` | `/` | F4 |
| `WhatIfPanel` | `{userId, baseCurve, bedtime, safeLineMg}` | `/` | F5 |
| `PresetGrid` | `{presets, onPick(preset)}` | `/log` | F6 |
| `AlcoholQuickAdd` | `{onAdd(units)}` | `/log` | F6 |
| `CaptureInput` | `{onResult(IdentifyResponse)}` | `/log` | F7 |
| `ConfirmCard` | `{result: IdentifyResponse, onConfirm(drink), onCancel}` | `/log` | F8 |
| `UsualSuggestions` | `{drinks: Drink[], onPick(drink)}` | `/log` | F9 |
| `OnboardingFlow` | `{onDone(user)}` | `/onboarding` | F10 |
| `MorningCheckin` | `{userId, night, onDone}` | layout | F11 |
| `HalfLifeCard` | `{profile}` | `/you` | F12 |
| `PosteriorChart` | `{history, posterior}` | `/you` | F13 |
| `CheckinHistory` | `{checkins}` | `/you` | F13 |
| `DemoSwitcher` | `{}` | `/demo` + hidden toggle | F14 (A) |
| `SettingsForm` | `{user, onSave}` | `/settings` | F15 |
| `SafetyNotice` | `{}` | `/settings`, onboarding | F15 |

`lib/types.ts` mirrors 0.2 and 0.4 one-to-one. Data fetching goes through `lib/api.ts` (F1). Until F1 lands, a component ticket can import fixture objects defined inline in its own preview route `frontend/app/dev/<component>/page.tsx`, which that ticket owns.

## 0.6 Jetson interfaces

```python
# detector.py (H3)
@dataclass
class Box: x1: int; y1: int; x2: int; y2: int; cls: str; conf: float   # cls in {"cup","bottle","wine glass"}
class Detector:
    def detect(self, frame: np.ndarray) -> list[Box]
# trigger.py (H4)
class Trigger:
    def update(self, boxes: list[Box], frame_w: int, frame_h: int, t: float) -> Box | None   # fires once
# uploader.py (H5)
def upload_crop(frame: np.ndarray, box: Box, api: str, user_id: int = 1) -> dict | None
# led.py (H1)
class Led:
    def set(self, color: Literal["green","amber","red","white","off"]) -> None
    def flash(self, color: str = "white", ms: int = 300) -> None
# state_loop.py (H2)
def run_state_loop(api: str, led: Led, interval_s: float = 2.0, stop: threading.Event | None = None) -> None
```

---

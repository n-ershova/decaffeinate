# Decaffeinate

**Know your last cup.**

*Working title. OxHack 2026 MVP whitepaper.*

---

## 1. Summary

Halflife learns how your body handles caffeine and tells you the last time you can have caffeine today and still sleep well.

Most caffeine apps apply one population average (a half-life of roughly 5 hours) to everyone. In reality caffeine half-life varies between people by a factor of several (roughly 2 to 10 hours), so the same 4pm coffee is harmless for one person and ruins the night for another. Halflife treats each user's half-life and caffeine sensitivity as unknowns and estimates them from their own drinking history and sleep, updating every morning.

The output is one clear decision, **"Last coffee today by 14:10"**, plus a what-if prediction for any extra drink. A small desk device built on an NVIDIA Jetson Orin Nano lets you log a drink by holding it up to a camera, and shows a red, amber or green light for whether you can still have caffeine today.

This document describes the minimal MVP for a 24 hour hackathon build.

---

## 2. Problem

- Caffeine is the most widely used stimulant in the world, and late caffeine is a common, avoidable cause of poor sleep.
- Generic advice ("no coffee after 2pm") ignores large individual differences in how fast caffeine is cleared.
- Existing trackers log intake and draw a generic decay curve. They never check whether their advice actually matched your sleep, so they never learn.
- Manual logging is tedious, so people stop doing it within days.

---

## 3. Solution overview

Four steps run in a loop:

1. **Log.** Pick a preset, take a photo, type a description, or hold the drink up to the Jetson. Gemini identifies the drink, a lookup table converts it to milligrams.
2. **See.** A live curve shows caffeine in your system from now until tomorrow morning, with bedtime and your personal sleep-safe line marked.
3. **Decide.** The app shows your cutoff time and predicts the sleep impact of any extra drink. The Jetson LED shows the same decision at a glance.
4. **Learn.** Each morning a short check-in records last night's sleep. A Bayesian model updates your personal half-life and sensitivity, and the estimate narrows over time.

---

## 4. MVP scope

| Priority | Feature |
|---|---|
| **Must** | Preset drink options and quick-add |
| **Must** | Photo and text logging via Gemini plus lookup table |
| **Must** | Caffeine curve with bedtime and sleep-safe line |
| **Must** | Personal Bayesian model (half-life and sensitivity) |
| **Must** | Cutoff time and what-if prediction |
| **Must** | Simulator and demo mode with seeded users |
| **Should** | Morning sleep check-in |
| **Should** | Jetson scan station with red, amber, green LED |
| **Should** | "Your profile" screen with posterior chart |
| **Could** | Presage heart rate check after a drink |
| **Could** | Experiment day suggestions |
| **Could** | "Plan my day" scheduling mode |
| **Could** | ElevenLabs spoken morning brief |
| **Out of scope** | Wearable integrations, accounts and auth, native mobile apps, multi-user support |

---

## 5. User experience

### 5.1 Onboarding (three questions)

1. Usual bedtime.
2. Do you smoke? (Smoking speeds up caffeine clearance substantially.)
3. Do you use hormonal contraception? (This slows caffeine clearance substantially.)

These set the starting guess (prior) for the user's half-life. Bodyweight and age are not collected: they have little effect on half-life, and their effect on concentration is absorbed by the personal sensitivity parameter (section 7.3).

### 5.2 Screens

**Today**
- Caffeine curve from now to next morning
- Bedtime marker and personal sleep-safe line
- Headline: "Last coffee today by 14:10" or "No more caffeine today"
- What-if button: "Have another one now?" shows the new curve and predicted extra minutes to fall asleep
- Daily total against the 400 mg cap

**Log**
- Camera capture and text box (both go through Gemini)
- Preset grid of common drinks
- Confirmation card with one-tap corrections for size, shots and decaf
- "Your usual?" suggestions based on history
- Alcohol quick-add (pint, glass of wine, spirit)

**You**
- "Your half-life: 7.1 h (plus or minus 1.0)" compared with the population average
- Sensitivity estimate in plain language
- Chart of the half-life estimate narrowing night by night
- Morning check-in history

**Demo mode** (hidden toggle)
- Switch between two simulated users with identical drinking habits but different true half-lives

### 5.3 Morning check-in

Shown on first open each day:
- What time did you go to bed?
- Roughly how long did it take to fall asleep? (slider, minutes)
- How rested do you feel? (1 to 5, stored but not used by the MVP model)

---

## 6. Drink recognition

### 6.1 Design principle

Gemini identifies the drink. It does **not** decide the caffeine number. Language models recognise drinks well but give unreliable milligram estimates, so caffeine comes from a curated lookup table, or from the printed label for packaged drinks.

### 6.2 Pipeline

```
photo / text / Jetson frame
        |
        v
Gemini (structured JSON output, constrained to known drink keys)
        |
        v
lookup table (mg estimate + range)   or   label value if readable
        |
        v
confirmation card (auto-accept if confidence high and source is a known can)
        |
        v
drinks table
```

### 6.3 Gemini output schema

```json
{
  "drink": "flat_white",
  "size": "regular",
  "shots": 2,
  "brand": "pret",
  "decaf": false,
  "label_mg": null,
  "confidence": 0.82
}
```

- `drink` is an enum of lookup table keys, so the model cannot invent drink types.
- `label_mg` is filled only when a caffeine amount is printed and legible on the packaging. In the UK and EU, drinks above 150 mg/L must state their caffeine content, so energy drinks are usually readable.
- If `drink` is `unknown`, the app asks the user to pick from presets.

### 6.4 Clarifying questions

Only ask when the answer changes the caffeine estimate materially:
- single or double shot
- decaf or regular
- size, when the cup is ambiguous

Never ask about milk type or syrups.

### 6.5 Lookup table (MVP subset)

Values are typical amounts with plausible ranges. Café drinks are stored per shot.

| Key | Serving | Typical mg | Range |
|---|---|---|---|
| espresso_shot | per shot | 65 | 50-100 |
| milk_coffee (latte, flat white, cappuccino, cortado, macchiato) | per shot | 65 per shot | 50-100 per shot |
| americano | per shot | 65 per shot | 50-100 per shot |
| mocha | per shot | 65 per shot + 10 | |
| filter_coffee | 240 ml | 95 | 70-140 |
| cold_brew | 350 ml | 200 | 150-250 |
| instant_coffee | mug | 60 | 30-90 |
| capsule_coffee | pod | 80 | 60-200 |
| decaf | mug | 5 | 2-15 |
| black_tea | 240 ml | 45 | 25-70 |
| green_tea | 240 ml | 30 | 20-45 |
| matcha | 1 tsp | 70 | 60-80 |
| chai_latte | regular | 40 | 25-60 |
| yerba_mate | 240 ml | 80 | 65-130 |
| iced_tea_bottled | bottle | 25 | 15-50 |
| cola | 330 ml | 32 | 30-35 |
| diet_cola | 330 ml | 40 | 35-45 |
| red_bull | 250 ml | 80 | 80 |
| energy_drink_500 | 500 ml | 160 | 150-170 |
| pre_workout | scoop | 200 | 150-300 |
| hot_chocolate | mug | 10 | 5-15 |
| herbal_tea | cup | 0 | 0 |

Default sizes: regular café drinks assume 2 shots, large assume 3. All values are editable by the user.

---

## 7. Algorithm

### 7.1 Notation

| Symbol | Meaning |
|---|---|
| D_i | caffeine dose of drink i (mg) |
| t_i | time of drink i |
| h | personal half-life (hours), unknown |
| k | elimination rate, k = ln 2 / h |
| T_b | bedtime |
| E_n | caffeine exposure during sleep on night n |
| L_n | reported sleep onset latency on night n (minutes) |
| A_n | alcohol units on day n |
| mu | baseline sleep latency, unknown |
| beta | caffeine sensitivity (minutes per 100 mg), unknown |
| gamma | alcohol effect on latency, unknown |

### 7.2 Caffeine amount in the body

Caffeine follows approximately first-order elimination. Ignoring the short absorption phase (peak around 45 minutes after drinking, negligible by bedtime):

```
C(t) = sum over drinks with t_i <= t of  D_i * exp( -k * (t - t_i) ),   k = ln(2) / h
```

C(t) is the amount in mg, not a blood concentration. Body size would scale concentration, but that scaling is absorbed into beta, which is why bodyweight is not needed.

### 7.3 Sleep exposure

The exposure for a night is the average caffeine amount over the first 3 hours after bedtime, which is less sensitive to the exact moment of falling asleep than the value at bedtime alone:

```
E_n(h) = mean of C(t) for t in [T_b, T_b + 3h]
```

This has a closed form for exponential decay, so no numerical integration is needed.

### 7.4 Sleep model

```
L_n = mu + beta * E_n(h) / 100 + gamma * A_n + noise_n,     noise_n ~ Normal(0, sigma^2)
```

- Outcome is sleep onset latency from the morning check-in (or a wearable in future).
- Alcohol enters the sleep model, not the metabolism model. Its main effect is on sleep itself, and including it stops heavy-drinking nights being misread as caffeine sensitivity.
- sigma is fixed at 12 minutes for the MVP, reflecting how noisy self-reported sleep is.

### 7.5 Priors

| Parameter | Prior |
|---|---|
| log h | Normal( log(h0), 0.4^2 ), with h0 = 5 h by default |
| h0 adjustment, smoker | h0 multiplied by 0.6 |
| h0 adjustment, hormonal contraception | h0 multiplied by 1.8 |
| mu | Normal( 15, 10^2 ) minutes |
| beta | Normal( 6, 6^2 ) minutes per 100 mg |
| gamma | Normal( 0, 5^2 ) minutes per unit (weak, let the data decide) |

The prior on h covers roughly 2 to 11 hours at two standard deviations, matching the spread seen in the population. The smoking and contraception multipliers are approximate and only set the starting point; the data overrides them.

### 7.6 Inference: grid over h, closed form for the rest

For a fixed h, the model is linear in w = (mu, beta, gamma), so the posterior over w and the marginal likelihood of the data are available in closed form (Bayesian linear regression). Only h needs a numerical treatment.

For each value of h on a grid of 200 log-spaced points between 1.5 and 15 hours:

1. Build the design matrix X with rows x_n = [1, E_n(h) / 100, A_n].
2. With prior w ~ Normal(m0, S0) and known noise sigma^2, compute:

```
S_N = ( S0^-1 + X^T X / sigma^2 )^-1
m_N = S_N ( S0^-1 m0 + X^T y / sigma^2 )

log marginal likelihood:
  y ~ Normal( X m0,  sigma^2 I + X S0 X^T )
```

3. Combine with the prior on h:

```
log p(h | data)  =  log p(h)  +  log p(y | h)  +  const
```

Normalise over the grid. The result is a full posterior over h, and for each h a Gaussian posterior over (mu, beta, gamma). The whole update takes milliseconds and runs every time a check-in or drink is saved.

To draw samples for decisions: sample h from the grid posterior, then sample w from Normal(m_N(h), S_N(h)). Samples with beta below zero are clipped to zero.

### 7.7 Identifiability

From sleep alone, a long half-life with low sensitivity can look similar to a short half-life with high sensitivity. What separates them is **variation in drink timing**: a late-afternoon coffee only affects sleep if the half-life is long. The model therefore learns faster when timing varies, which motivates experiment days (section 7.10). The posterior reports this uncertainty honestly instead of hiding it.

### 7.8 Decisions

**Tolerance.** The user picks how strict to be, as the extra sleep latency they will accept from caffeine:

| Setting | delta (minutes) |
|---|---|
| Strict | 5 |
| Normal (default) | 10 |
| Relaxed | 20 |

**Cutoff time.** For a standard drink D_s (130 mg, a two-shot coffee) and today's logged drinks:

1. For each posterior sample (h, beta), scan candidate times t from now to bedtime in 5 minute steps.
2. Compute predicted extra latency beta * E(h) / 100 with the extra drink at time t.
3. That sample's cutoff is the latest t where the predicted extra latency is at most delta.
4. Report the 20th percentile of the cutoff across samples, so the advice is safe with roughly 80% posterior probability.

If even no more caffeine would exceed delta, show "No more caffeine today".

**What-if.** For a proposed drink now, report the median and an 80% interval of the predicted extra minutes to fall asleep.

**Daily cap.** Regardless of the model, the app never suggests more caffeine once the day's total reaches 400 mg, and it never recommends increasing intake.

### 7.9 LED state

| State | Rule |
|---|---|
| Green | A standard 130 mg drink now is within tolerance with at least 80% probability |
| Amber | A standard drink is not safe, but a small 45 mg drink (a cup of tea) is |
| Red | Even a small drink is not safe, or the 400 mg daily cap is reached |

The same rule drives the colour of the headline on the Today screen.

### 7.10 Experiment days (stretch)

Occasionally the app suggests a drink timing that would teach the model the most. From a few candidate times (for example 10:00, 13:00, 15:00, 17:00), it picks the one where posterior samples disagree most about the resulting sleep exposure, which is a cheap proxy for expected information gain. Suggestions are restricted to times the current model already considers within a relaxed tolerance, so experiments never deliberately ruin a night.

### 7.11 Cold start

With no data the model uses the prior alone. Because the cutoff uses the 20th percentile, early advice is conservative and becomes less conservative only as evidence accumulates.

### 7.12 Simulator (for the demo)

Generates synthetic users with known true parameters:
- true h and beta drawn per user (the demo uses h = 3 and h = 8 with the same beta)
- 21 days of realistic drinking: 1 to 3 drinks a day, morning coffee plus a variable afternoon drink
- occasional alcohol
- sleep latency drawn from the sleep model with sigma = 12 minutes

Running the real inference on simulated data shows the two posteriors separating and the cutoffs diverging (for example 17:30 versus 11:45) despite identical habits. Simulated data is clearly labelled in the UI.

### 7.13 Plan my day (stretch)

Given wake time, bedtime and a time when the user needs to be sharpest, choose drink times and sizes from a small discrete set to maximise caffeine in the body at the target time, subject to the bedtime tolerance and the daily cap. With a handful of options this is solved by brute-force search.

---

## 8. Jetson scan station

### 8.1 Objective

The device sits on the table. You hold your drink up to the camera, it logs the drink to the app automatically, and an LED shows whether you can still have caffeine today.

### 8.2 Hardware

| Component | Notes |
|---|---|
| NVIDIA Jetson Orin Nano | On-device detection |
| USB webcam | Any UVC webcam |
| RGB LED (common cathode) | Driven from three GPIO pins |
| 3 x 220 to 330 ohm resistors | One per colour channel |
| Jumper wires and a small enclosure | Cardboard is fine; it helps the handmade prize |
| Optional buzzer | Confirmation beep |

Use any three free GPIO pins on the 40-pin header (check the pinout for the board and configure with `jetson-io` if needed). The header uses 3.3 V logic.

### 8.3 Software pipeline

```
webcam frames
    |
    v
YOLO nano model (TensorRT, COCO classes: cup, bottle, wine glass)
    |
    v
trigger: drink held in the centre zone, large enough, stable for about 1 second
    |
    v
crop to the drink's bounding box  ->  POST /drinks/identify (source = jetson)
    |
    v
backend: Gemini + lookup table -> auto-log if confident, else ask in the app
    |
    v
LED loop: GET /state every 2 seconds -> set red / amber / green
```

- **Cooldown** of 10 seconds after a trigger to avoid double logging.
- **Privacy:** frames are processed on the device. Only a crop of the drink is sent, never full frames, so faces do not leave the device.
- **Caffeine is never calculated on the Jetson.** The backend is the single source of truth, and the Jetson only detects and displays.
- **Feedback:** brief white flash or beep when a drink is captured, then the LED returns to the decision colour.

### 8.4 Fallback

If detection is unreliable by the go/no-go checkpoint, reduce the device to a button plus camera: press the button, it captures one frame and sends it through the same path. If the camera fails entirely, the LED alone still works as a desk status light driven by `/state`.

---

## 9. Presage heart rate check (stretch)

About 45 minutes after a logged drink, the app offers a 30 second camera scan using the Presage SDK and stores heart rate and breathing rate against that drink. In the MVP these readings are displayed in the profile but are not used by the core model. Caffeine's acute effect on heart rate is modest and varies between people, so it is treated as a weak supporting signal rather than a basis for decisions.

---

## 10. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js + React + TypeScript | Fast to build, one codebase for laptop and phone |
| Styling | Tailwind CSS | Quick, consistent UI without design overhead |
| Charts | Recharts | Simple line and area charts for the curve and posterior |
| Delivery | Responsive web app (installable as a PWA) | Avoids native builds and app store issues |
| Backend | Python + FastAPI | The model is numerical Python; FastAPI gives typed endpoints quickly |
| Numerics | NumPy, SciPy | Grid posterior and linear algebra |
| Database | Tiger Data (managed TimescaleDB on Postgres) | Time-series data with plain SQL; hypertables and continuous aggregates suit drink logs and daily totals |
| Drink recognition | Gemini API (Flash-tier model, structured JSON output) | Strong image and text understanding, schema-constrained output |
| Edge detection | Ultralytics YOLO nano exported to TensorRT on the Jetson | Real-time detection on-device with pretrained cup and bottle classes |
| Jetson I/O | Python, OpenCV, Jetson.GPIO, requests | Minimal moving parts |
| Heart rate (stretch) | Presage SDK | Camera-based vital signs |
| Voice (stretch) | ElevenLabs API | Spoken morning brief |
| Hosting | Local laptop for the demo; Vultr instance if time allows | Local is safest on venue Wi-Fi; Vultr gives a public URL |
| Networking | Laptop, phone and Jetson on one phone hotspot | Removes dependence on venue Wi-Fi |

### 10.1 Repository layout

```
halflife/
  backend/
    app/
      main.py            FastAPI routes
      model.py           caffeine curve, Bayesian fit, decisions
      simulate.py        synthetic users for the demo
      drinks.py          lookup table and Gemini call
      db.py              Tiger Data access
    tests/
  frontend/
    app/                 Next.js routes: today, log, you
    components/
  jetson/
    scan_station.py      detection, trigger, upload, LED loop
    led.py
  data/
    drinks.json          lookup table
    seed_demo.sql
  README.md
```

---

## 11. Data model

```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          TEXT,
  bedtime       TIME,
  smoker        BOOLEAN,
  hormonal_bc   BOOLEAN,
  tolerance_min INT DEFAULT 10,
  is_simulated  BOOLEAN DEFAULT FALSE
);

CREATE TABLE drinks (
  time        TIMESTAMPTZ NOT NULL,
  user_id     INT REFERENCES users(id),
  drink_key   TEXT,
  mg          REAL,
  mg_low      REAL,
  mg_high     REAL,
  source      TEXT          -- preset | photo | text | jetson | simulated
);
SELECT create_hypertable('drinks', 'time');

CREATE TABLE alcohol (
  time     TIMESTAMPTZ NOT NULL,
  user_id  INT REFERENCES users(id),
  units    REAL
);
SELECT create_hypertable('alcohol', 'time');

CREATE TABLE sleep_nights (
  night       DATE,
  user_id     INT REFERENCES users(id),
  bedtime     TIMESTAMPTZ,
  latency_min REAL,
  rested_1to5 INT,
  PRIMARY KEY (user_id, night)
);

CREATE TABLE hr_checks (
  time      TIMESTAMPTZ NOT NULL,
  user_id   INT REFERENCES users(id),
  drink_time TIMESTAMPTZ,
  hr_bpm    REAL,
  br_bpm    REAL
);
SELECT create_hypertable('hr_checks', 'time');

-- daily caffeine totals for charts and the 400 mg cap
CREATE MATERIALIZED VIEW daily_caffeine
WITH (timescaledb.continuous) AS
SELECT user_id, time_bucket('1 day', time) AS day, SUM(mg) AS total_mg
FROM drinks
GROUP BY user_id, day;
```

The model state is not stored; it is recomputed from these tables on each update, which takes milliseconds.

---

## 12. API

| Method | Route | Purpose |
|---|---|---|
| POST | `/drinks/identify` | Image or text in, Gemini result plus mg estimate out |
| POST | `/drinks` | Save a confirmed drink |
| POST | `/alcohol` | Save alcohol units |
| POST | `/sleep` | Save a morning check-in |
| GET | `/state` | Curve, cutoff, LED colour, daily total |
| POST | `/whatif` | Predicted sleep impact of a proposed drink |
| GET | `/profile` | Half-life and sensitivity posterior, history |
| POST | `/demo/seed` | Create simulated users and history |
| POST | `/hr` | Save a Presage reading (stretch) |

Example `/state` response:

```json
{
  "now_mg": 142,
  "bedtime": "23:30",
  "cutoff": "14:10",
  "led": "amber",
  "daily_total_mg": 195,
  "curve": [{"t": "16:00", "mg": 142}, {"t": "16:15", "mg": 139}],
  "safe_line_mg": 38
}
```

---

## 13. Prize alignment

| Prize | How Halflife fits |
|---|---|
| Main track (theme: Time) | Caffeine decay over time is the product; the output is a time-based decision |
| HRT: Best Use of Data for Predictions and Decision Making | Personal Bayesian model that predicts sleep impact and turns it into a cutoff decision |
| MLH: Best Use of Gemini API | Drink recognition from photos, text and Jetson frames with structured output |
| MLH: Best Use of Tiger Data | Time-series storage of drinks, alcohol and HR; continuous aggregate for daily totals |
| MLH: Best Use of Presage | Post-drink heart rate check (stretch) |
| Best Handmade / Hackiest Hack | Jetson scan station with LED in a handmade enclosure |
| MLH: Best Use of Vultr | Backend hosting if deployed |
| MLH: Best Use of ElevenLabs | Spoken morning brief (stretch) |

Check the rules for any limit on the number of sponsor prizes per project before submitting.

---

## 14. Build plan

### 14.1 Roles (team of 3 to 4)

| Role | Owns |
|---|---|
| Model | `model.py`, `simulate.py`, `/state`, `/whatif`, `/profile` |
| Data and logging | Tiger Data schema, seed data, lookup table, Gemini integration |
| Frontend | Today, Log and You screens, charts, demo toggle |
| Hardware | Jetson detection, trigger, LED, enclosure |

### 14.2 Timeline

| Phase | Goal |
|---|---|
| Saturday afternoon | API contract agreed, schema live, model running on simulated data, skeleton screens |
| Saturday evening | End-to-end path working: log a drink, curve updates, cutoff shown |
| Midnight | Jetson go/no-go: reliably detecting and logging a held-up drink, or fall back (section 8.4) |
| Overnight | Photo logging, profile screen, what-if, LED driven by `/state` |
| Sunday morning | Feature freeze. Polish, seed demo data, rehearse the demo several times |
| Before deadline | Devpost write-up, screenshots, short demo video |

---

## 15. Demo script (4 to 5 minutes, science fair format)

1. **Hook (15 s).** "Everyone has lost a night to a late coffee. The usual advice treats everyone the same, but people clear caffeine at very different speeds."
2. **Live log (45 s).** Hold a can of energy drink up to the Jetson. It is recognised, the curve on screen jumps, the cutoff moves, the LED changes colour. Then log a takeaway coffee by photo to show the correction card.
3. **What-if (30 s).** "If I have another one now, here is tonight": predicted extra minutes to fall asleep.
4. **How it learns (90 s).** Demo toggle: two simulated users with identical habits. Show their half-life estimates separating night by night and their cutoffs diverging.
5. **For stats-minded judges (30 s).** Half-life and sensitivity are confounded when you only observe sleep; timing variation separates them, which is why the app suggests experiment days. All advice is taken at a conservative posterior quantile.
6. **Close (15 s).** Roadmap: wearable integration, more drinks, plan my day.

Order props so the most reliable recognition (a labelled can) happens first.

---

## 16. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Venue Wi-Fi fails | All devices on one phone hotspot; backend runs locally |
| Jetson setup eats time | Strict midnight go/no-go; button-capture fallback; app works without it |
| Gemini misidentifies a drink | Confirmation card, presets, label reading, "your usual" |
| Model looks unconvincing with little data | Simulated users with known truth show it converging |
| Gemini API latency or rate limits | Presets and text logging as instant fallbacks; cache results for demo props |
| Scope creep | Must/Should/Could list; feature freeze Sunday morning |

---

## 17. Limitations and safety

- **Not medical advice.** Halflife gives general wellness guidance, not diagnosis or treatment.
- **Inference, not measurement.** Caffeine levels are estimated from logged drinks and a model; nothing measures blood caffeine. The app shows uncertainty ranges rather than single numbers.
- **Noisy sleep data.** Self-reported sleep is imprecise and influenced by stress, exercise, screens and more. The model needs roughly 2 to 3 weeks to become useful.
- **Hard limits.** Never recommends increasing intake; enforces a 400 mg daily cap for healthy adults.
- **Not intended for** pregnancy, under-18s, or people with heart conditions or on medications that interact with caffeine. These users are told to follow medical guidance instead.
- **Privacy.** The Jetson only sends cropped drink images. Health-adjacent data stays in the user's own database instance.

---

## 18. Future work

- Wearable integrations (Apple Health, Garmin, Whoop, Fitbit) to replace the manual check-in
- Richer sleep outcomes (total sleep, deep sleep, wake-ups) combined into one score
- Absorption phase in the caffeine model for daytime alertness predictions
- Plan my day with calendar integration
- Population-level priors learned from many users
- Native mobile apps and home screen widgets

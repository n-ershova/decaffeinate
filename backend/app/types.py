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

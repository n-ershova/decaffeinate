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
    "energy_drink_500", "pre_workout", "hot_chocolate", "herbal_tea",
    "oolong_tea", "white_tea", "milk_tea",
    # Caffeinated food and supplements, logged the same way as drinks.
    "dark_chocolate", "milk_chocolate", "chocolate_bake", "coffee_bake", "tiramisu",
    "coffee_ice_cream", "espresso_beans", "caffeine_gum", "energy_gel", "caffeine_pill",
    # Caffeine-free drinks, so water or juice is recognised rather than unknown.
    "water", "sparkling_water", "milk", "plant_milk", "juice", "smoothie", "lemonade",
    "coconut_water", "sports_drink", "protein_shake", "caffeine_free_soda",
    "caffeine_free_cola", "golden_milk", "barley_tea", "chicory_coffee",
    # Soft and energy drinks.
    "citrus_soda", "pepper_soda", "root_beer", "orange_soda", "guarana_soda", "mate_soda",
    "caffeinated_water", "energy_shot", "fitness_energy_drink", "energy_drink_high",
    # Coffee styles and regional coffees.
    "ristretto", "lungo", "moka_pot", "french_press", "iced_coffee", "nitro_cold_brew",
    "bottled_coffee", "blended_coffee", "half_caf", "bulletproof_coffee", "mushroom_coffee",
    "coffee_milk", "greek_frappe", "dalgona_coffee", "turkish_coffee", "arabic_coffee",
    "ethiopian_buna", "cuban_coffee", "vietnamese_coffee", "egg_coffee", "thai_iced_coffee",
    "kopi", "yuanyang", "cafe_de_olla", "dirty_chai", "irish_coffee", "espresso_martini",
    "coffee_liqueur", "cascara", "coffee_leaf_tea",
    # Teas and tea-like infusions.
    "pu_erh", "hojicha", "genmaicha", "gyokuro", "kukicha", "yellow_tea", "turkish_tea",
    "moroccan_mint_tea", "butter_tea", "noon_chai", "kombucha", "guayusa", "yaupon",
    "mate_gourd",
    # Chocolate, malt, food and supplements.
    "chocolate_milk", "malted_drink", "ceremonial_cacao", "coffee_jelly", "coffee_yogurt",
    "coffee_candy", "caffeine_mints", "caffeinated_bar", "caffeine_pouch",
    "unknown",
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

class Alternative(BaseModel):
    drink: str                          # one of DRINK_KEYS
    confidence: float

class DrinkAnalysis(BaseModel):
    """Descriptive detail for display only; caffeine mg never comes from here."""
    verdict: str                        # short headline, e.g. "Starbucks grande oat latte"
    description: str                    # what is visible, in a sentence or two
    category: Literal["coffee", "tea", "energy_drink", "soft_drink", "chocolate",
                      "other_drink", "food", "supplement", "not_a_drink"]
    product_name: str | None = None     # e.g. "Monster Ultra White"
    container: Literal["paper_cup", "mug", "glass", "can", "bottle", "carton",
                       "pod", "other"] | None = None
    volume_ml: float | None = None
    volume_source: Literal["printed", "estimated"] | None = None
    temperature: Literal["hot", "iced", "room"] | None = None
    milk: str | None = None             # e.g. "oat", "whole", "none"
    additions: list[str] = []           # syrups, cream, sugar, toppings
    visible_text: list[str] = []        # legible printed text, verbatim
    printed_caffeine: str | None = None # caffeine text exactly as printed
    evidence: list[str] = []            # cues behind the identification
    alternatives: list[Alternative] = []
    image_issues: list[str] = []        # blur, glare, partly out of frame

class GeminiResult(BaseModel):          # §6.3
    drink: str                          # one of DRINK_KEYS
    size: Literal["small", "regular", "large"] | None = None
    shots: int | None = None
    brand: str | None = None
    decaf: bool = False
    label_mg: float | None = None
    confidence: float
    product: str | None = None          # a data/products.json key, when brand and product match
    label_mg_per_100ml: float | None = None  # printed concentration; needs a printed volume
    analysis: DrinkAnalysis | None = None

Size = Literal["small", "regular", "large"]

class SizeOption(BaseModel):
    ml: float | None; mg: float; mg_low: float; mg_high: float

class DrinkEstimate(BaseModel):
    drink_key: str; label: str; mg: float; mg_low: float; mg_high: float
    needs: list[Literal["shots", "decaf", "size"]]   # clarifying questions, §6.4
    auto_accept: bool
    # Where mg came from: printed label > branded product > table scaled by volume > table.
    basis: Literal["label", "product", "volume", "table"] = "table"
    size: Size | None = None                         # the product size mg refers to
    sizes: dict[Size, SizeOption] | None = None      # per-size mg for branded products

class Preset(BaseModel):
    key: str; label: str; mg: float; mg_low: float; mg_high: float

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

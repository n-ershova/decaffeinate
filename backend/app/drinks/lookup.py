"""Caffeine comes from a printed label, a branded product, or the lookup table, never the LLM.

Precedence: printed label > branded product (data/products.json) > table scaled to
the serving volume > table. Gemini only says which drink, product and volume it saw.
"""
import json
import math
import re
from pathlib import Path

from app.types import DrinkEstimate, GeminiResult, Preset, SizeOption

DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "drinks.json"
PRODUCTS_PATH = DATA_PATH.parent / "products.json"
_ROWS = {row["key"]: row for row in json.loads(DATA_PATH.read_text(encoding="utf-8"))}
PRODUCTS = {row["key"]: row for row in json.loads(PRODUCTS_PATH.read_text(encoding="utf-8"))}
_PACKAGED = {"iced_tea_bottled", "cola", "diet_cola", "red_bull", "energy_drink_500"}
# Café figures are chain averages; real shots vary, so keep a range around them.
CAFE_SPREAD = 0.25
# Volumes outside this are misreads, not drinks.
VOLUME_ML = (30, 2000)
# Above this it isn't one drink: a troll input or a misread, so treat it as unknown.
MAX_DRINK_MG = 1000
# Bigger single servings are real but rare, so a person confirms them.
AUTO_ACCEPT_MAX_MG = 400
# With no volume, a stated size scales the reference serving (matches ConfirmCard).
SIZE_SCALE = {"small": 0.75, "regular": 1, "large": 1.5}


def _volume(result: GeminiResult) -> float | None:
    ml = result.analysis.volume_ml if result.analysis else None
    return ml if ml is not None and VOLUME_ML[0] <= ml <= VOLUME_ML[1] else None


def _sizes(product) -> dict[str, SizeOption]:
    spread = 0 if product["exact"] else CAFE_SPREAD
    return {size: SizeOption(ml=v["ml"], mg=v["mg"], mg_low=round(v["mg"] * (1 - spread)),
                             mg_high=round(v["mg"] * (1 + spread)))
            for size, v in product["sizes"].items()}


def _pick_size(sizes, size, volume):
    if size in sizes:
        return size
    if len(sizes) == 1:
        return next(iter(sizes))
    if volume is not None:
        return min(sizes, key=lambda s: abs((sizes[s].ml or 0) - volume))
    return None


def estimate(result: GeminiResult) -> DrinkEstimate:
    row = _ROWS.get(result.drink)
    key = result.drink if row else "unknown"
    needs = []
    mg = low = high = 0.0
    if row:
        mg, low, high = (float(row[k]) for k in ("mg", "low", "high"))
        if row["per"] == "shot":
            if result.shots is not None:
                if result.shots < 1:
                    raise ValueError("shots must be positive")
                count = result.shots
            else:
                count = {"small": 1, "regular": 2, "large": 3}.get(result.size, 2)
                if result.size is None:
                    needs = ["shots", "size"]
            mg, low, high = mg * count, low * count, high * count
            if key == "mocha":
                mg, low, high = mg + 10, low + 10, high + 10
    label = row["label"] if row else "Choose a preset"
    basis, size, sizes = "table", None, None
    volume = _volume(result)
    if row and row["per"] == "serving" and ((row.get("ml") and volume) or result.size):
        # Volume when we have it; otherwise size, which also covers food with no volume.
        scale = volume / row["ml"] if row.get("ml") and volume else SIZE_SCALE[result.size]
        if scale != 1:
            mg, low, high = mg * scale, low * scale, high * scale
            if row.get("ml"):
                label = f'{re.sub(r" [(][0-9]+ ml[)]$", "", label)} ({round(row["ml"] * scale)} ml)'
            else:
                label = f"{label}, {result.size}"
            basis = "volume"

    product = PRODUCTS.get(result.product) if result.product else None
    if product and product["drink"] == key:
        sizes = _sizes(product)
        size = _pick_size(sizes, result.size, volume)
        needs = [] if size else ["size"]
        chosen = sizes[size or ("regular" if "regular" in sizes else next(iter(sizes)))]
        mg, low, high = chosen.mg, chosen.mg_low, chosen.mg_high
        label, basis = product["label"], "product"
    else:
        product = None

    if result.decaf:
        # Decaf only ever lowers caffeine: naturally caffeine-free drinks stay at 0.
        mg, low, high = min(mg, 5.0), min(low, 2.0), min(high, 15.0)
        needs, basis, sizes = [], "table", None
    if result.label_mg is not None:
        if not math.isfinite(result.label_mg) or result.label_mg < 0:
            raise ValueError("label_mg must be finite and nonnegative")
        mg = low = high = result.label_mg
        needs, basis, sizes = [], "label", None
    # The frozen needs enum has no preset option: unknown + empty needs tells
    # the confirmation UI to show the preset picker (whitepaper §6.3).
    if mg > MAX_DRINK_MG:
        return DrinkEstimate(drink_key="unknown", label="Choose a preset", mg=0, mg_low=0,
                             mg_high=0, needs=[], auto_accept=False)
    return DrinkEstimate(
        drink_key=key, label=label,
        mg=round(mg, 1), mg_low=round(low, 1), mg_high=round(high, 1), needs=needs,
        auto_accept=result.confidence >= 0.8 and mg <= AUTO_ACCEPT_MAX_MG and
        (key in _PACKAGED or result.label_mg is not None or bool(product and product["exact"])),
        basis=basis, size=size if sizes else None, sizes=sizes,
    )


def presets() -> list[Preset]:
    return [Preset(key=key, label=row["label"],
                   mg=row["mg"] * (2 if row["per"] == "shot" and key != "espresso_shot" else 1)
                   + (10 if key == "mocha" else 0),
                   mg_low=row["low"] * (2 if row["per"] == "shot" and key != "espresso_shot" else 1)
                   + (10 if key == "mocha" else 0),
                   mg_high=row["high"] * (2 if row["per"] == "shot" and key != "espresso_shot" else 1)
                   + (10 if key == "mocha" else 0))
            for key, row in _ROWS.items() if row["preset"]]

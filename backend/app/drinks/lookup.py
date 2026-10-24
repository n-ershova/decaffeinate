"""Caffeine comes from the lookup table or a printed label, never the LLM."""
import json
import math
from pathlib import Path

from app.types import DrinkEstimate, GeminiResult, Preset

DATA_PATH = Path(__file__).resolve().parents[3] / "data" / "drinks.json"
_ROWS = {row["key"]: row for row in json.loads(DATA_PATH.read_text(encoding="utf-8"))}
_PACKAGED = {"iced_tea_bottled", "cola", "diet_cola", "red_bull", "energy_drink_500"}


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
    if result.decaf:
        mg, low, high = 5.0, 2.0, 15.0
        needs = []
    if result.label_mg is not None:
        if not math.isfinite(result.label_mg) or result.label_mg < 0:
            raise ValueError("label_mg must be finite and nonnegative")
        mg = low = high = result.label_mg
        needs = []
    # The frozen needs enum has no preset option: unknown + empty needs tells
    # the confirmation UI to show the preset picker (whitepaper §6.3).
    return DrinkEstimate(
        drink_key=key, label=row["label"] if row else "Choose a preset",
        mg=mg, mg_low=low, mg_high=high, needs=needs,
        auto_accept=result.confidence >= 0.8 and
        (key in _PACKAGED or result.label_mg is not None),
    )


def presets() -> list[Preset]:
    return [Preset(key=key, label=row["label"],
                   mg=row["mg"] * (2 if row["per"] == "shot" and key != "espresso_shot" else 1)
                   + (10 if key == "mocha" else 0),
                   mg_low=row["low"] * (2 if row["per"] == "shot" and key != "espresso_shot" else 1)
                   + (10 if key == "mocha" else 0),
                   mg_high=row["high"] * (2 if row["per"] == "shot" and key != "espresso_shot" else 1)
                   + (10 if key == "mocha" else 0), emoji=row["emoji"])
            for key, row in _ROWS.items() if row["preset"]]

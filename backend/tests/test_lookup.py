import json

import pytest

from app.drinks.lookup import DATA_PATH, estimate, presets
from app.types import DRINK_KEYS, GeminiResult


@pytest.mark.parametrize("fields,mg,auto", [
    ({"drink": "milk_coffee", "size": "regular"}, 130, False),
    ({"drink": "americano", "size": "large"}, 195, False),
    ({"drink": "milk_coffee", "decaf": True}, 5, False),
    ({"drink": "red_bull"}, 80, True),
    ({"drink": "mocha", "shots": 2}, 140, False),
    ({"drink": "americano", "size": "large", "shots": 1}, 65, False),
    ({"drink": "milk_coffee", "decaf": True, "label_mg": 42}, 42, True),
    ({"drink": "herbal_tea"}, 0, False),
    ({"drink": "espresso_shot", "size": "regular"}, 130, False),
])
def test_estimates(fields, mg, auto):
    result = estimate(GeminiResult(confidence=.8, **fields))
    assert result.mg == mg
    assert result.auto_accept == auto
    assert result.mg_low <= result.mg <= result.mg_high
    assert result.needs == []


def test_table_and_presets_cover_the_contract():
    rows = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    assert {r["key"] for r in rows} == set(DRINK_KEYS) - {"unknown"}
    assert len(rows) == 22
    assert {p.key for p in presets()} == {r["key"] for r in rows if r["preset"]}
    assert next(p for p in presets() if p.key == "milk_coffee").mg == 130


def test_ambiguous_cafe_and_unknown():
    cafe = estimate(GeminiResult(drink="milk_coffee", confidence=.99))
    assert set(cafe.needs) == {"shots", "size"}
    assert not cafe.auto_accept
    unknown = estimate(GeminiResult(drink="unknown", confidence=.99))
    assert unknown.drink_key == "unknown"
    assert unknown.label == "Choose a preset"
    assert unknown.mg == 0 and not unknown.auto_accept
    assert estimate(GeminiResult(drink="invented", confidence=.9)).drink_key == "unknown"


def test_confidence_and_label_bounds():
    assert not estimate(GeminiResult(drink="red_bull", confidence=.799)).auto_accept
    result = estimate(GeminiResult(drink="unknown", confidence=.9, label_mg=0))
    assert result.mg == result.mg_low == result.mg_high == 0
    assert result.auto_accept
    for value in (-1, float("nan"), float("inf")):
        with pytest.raises(ValueError):
            estimate(GeminiResult(drink="cola", confidence=1, label_mg=value))

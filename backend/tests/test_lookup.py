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
    assert len(rows) == 113
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


def _seen(volume_ml=None, **fields):
    analysis = {"verdict": "v", "description": "d", "category": "coffee", "volume_ml": volume_ml}
    return GeminiResult(confidence=.9, analysis=analysis, **fields)


def test_serving_drinks_scale_with_volume():
    can = estimate(_seen(500, drink="cola"))
    assert can.basis == "volume" and round(can.mg) == round(32 * 500 / 330)
    assert can.mg_low <= can.mg <= can.mg_high
    assert estimate(_seen(5000, drink="cola")).basis == "table"  # implausible volume ignored
    assert estimate(_seen(400, drink="milk_coffee", size="regular")).mg == 130  # shots, not volume


def test_branded_product_sizes():
    grande = estimate(_seen(drink="milk_coffee", product="starbucks_caffe_latte", size="regular"))
    assert (grande.basis, grande.mg, grande.size, grande.needs) == ("product", 150, "regular", [])
    assert grande.label == "Starbucks Caffè Latte" and set(grande.sizes) == {"small", "regular", "large"}
    assert grande.mg_low < 150 < grande.mg_high and not grande.auto_accept
    by_volume = estimate(_seen(360, drink="filter_coffee", product="starbucks_pike_place"))
    assert by_volume.size == "small" and by_volume.mg == 235
    unsized = estimate(_seen(drink="americano", product="starbucks_americano"))
    assert unsized.needs == ["size"] and unsized.mg == 225


def test_packaged_product_is_exact_and_auto_accepts():
    ultra = estimate(_seen(drink="energy_drink_500", product="monster_ultra_500"))
    assert ultra.mg == ultra.mg_low == ultra.mg_high == 150 and ultra.auto_accept


def test_product_mismatch_label_and_decaf_precedence():
    assert estimate(_seen(drink="cola", product="starbucks_caffe_latte")).basis == "table"
    labelled = estimate(_seen(drink="energy_drink_500", product="monster_ultra_500", label_mg=140))
    assert (labelled.basis, labelled.mg, labelled.sizes) == ("label", 140, None)
    decaf = estimate(_seen(drink="milk_coffee", product="starbucks_caffe_latte", decaf=True))
    assert decaf.mg == 5 and decaf.sizes is None


def test_volume_label_and_size_fallback():
    assert estimate(_seen(500, drink="cola")).label == "Cola (500 ml)"
    small = estimate(_seen(drink="filter_coffee", size="small"))
    assert (small.mg, small.label) == (71.2, "Filter coffee (180 ml)")
    assert estimate(_seen(drink="filter_coffee")).basis == "table"


def test_implausible_amounts_are_unknown_or_need_confirming():
    assert estimate(GeminiResult(drink="milk_coffee", shots=20, confidence=1)).drink_key == "unknown"
    assert estimate(GeminiResult(drink="red_bull", label_mg=9999, confidence=1)).drink_key == "unknown"
    two_litres = estimate(_seen(2000, drink="energy_drink_500"))
    assert two_litres.mg == 640 and not two_litres.auto_accept


def test_decaf_never_raises_caffeine_and_teas_are_covered():
    assert estimate(GeminiResult(drink="herbal_tea", decaf=True, confidence=.9)).mg == 0
    assert estimate(GeminiResult(drink="black_tea", decaf=True, confidence=.9)).mg == 5
    for key, mg in (("oolong_tea", 38), ("white_tea", 28), ("milk_tea", 90)):
        assert estimate(GeminiResult(drink=key, confidence=.9)).mg == mg


def test_caffeinated_food_scales_by_portion():
    slice_ = estimate(GeminiResult(drink="coffee_bake", confidence=.9))
    assert (slice_.mg, slice_.mg_low, slice_.basis) == (20, 0, "table")
    big = estimate(GeminiResult(drink="dark_chocolate", size="large", confidence=.9))
    assert big.mg == 37.5 and big.label == "Dark chocolate (30 g), large" and not big.auto_accept


def test_units_do_not_scale_and_pills_use_label_doses():
    assert estimate(GeminiResult(drink="caffeine_pill", size="small", confidence=.9)).mg == 100
    pro_plus = estimate(GeminiResult(drink="caffeine_pill", product="pro_plus", confidence=.9))
    assert (pro_plus.mg, pro_plus.basis, pro_plus.auto_accept) == (50, "product", True)
    bar = estimate(GeminiResult(drink="milk_chocolate", size="regular", confidence=.9))
    assert (bar.basis, bar.label) == ("table", "Milk chocolate bar (45 g)")

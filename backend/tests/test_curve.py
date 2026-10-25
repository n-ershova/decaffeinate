from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import pytest

from app.model.curve import DEFAULT_H, amount_at, bedtime_mg, curve, latest_safe_drink, sleep_exposure
from app.types import Drink
from model import CaffeineMonitor

T0 = datetime(2026, 10, 24, 8, tzinfo=timezone.utc)


def drink(at, mg=100):
    return Drink(time=at, user_id=1, drink_key="filter_coffee", mg=mg, mg_low=mg, mg_high=mg, source="preset")


@pytest.mark.parametrize("h", [3, 5, 8])
def test_half_remains_after_h_hours(h):
    assert amount_at([drink(T0)], T0 + timedelta(hours=h), h) == pytest.approx(50)
    assert amount_at([drink(T0)], T0 - timedelta(minutes=1), h) == 0


def test_matches_caffeine_monitor():
    monitor = CaffeineMonitor((23, 30))
    for hours in (0, 1.5, 5, 12):
        assert amount_at([drink(T0, 130)], T0 + timedelta(hours=hours), DEFAULT_H) == \
            pytest.approx(monitor.calculate_caffeine(hours, 130))


def test_linear_and_curve_steps():
    a, b = drink(T0, 130), drink(T0 + timedelta(hours=5), 45)
    t = T0 + timedelta(hours=7)
    assert amount_at([a, b], t, 5) == pytest.approx(amount_at([a], t, 5) + amount_at([b], t, 5))
    points = curve([a], T0, T0 + timedelta(hours=1), 5, step_min=15)
    assert [p[0] for p in points] == [T0 + timedelta(minutes=15 * i) for i in range(5)]
    assert points[0][1] == 130


@pytest.mark.parametrize("offset_h", [-6, -0.5, 0, 1, 2.9, 3.5])
def test_sleep_exposure_matches_numerical_mean(offset_h):
    bedtime = T0 + timedelta(hours=15)
    drinks = [drink(bedtime + timedelta(hours=offset_h), 130), drink(T0, 95)]
    minutes = [bedtime + timedelta(minutes=m + 0.5) for m in range(180)]
    numeric = sum(amount_at(drinks, t, 5) for t in minutes) / len(minutes)
    assert sleep_exposure(drinks, bedtime, 5) == pytest.approx(numeric, rel=1e-3)


def test_clocks_going_back():
    london = ZoneInfo("Europe/London")
    start = datetime(2026, 10, 25, 0, 30, tzinfo=london)  # 01:00–02:00 happens twice
    coffee = drink(start, 130)
    points = curve([coffee], start, datetime(2026, 10, 25, 8, tzinfo=london), 5, step_min=15)
    assert len(points) == 35  # 8.5 real hours at 15 min
    gaps = {(b[0] - a[0].astimezone(timezone.utc)).total_seconds() for a, b in zip(points, points[1:])}
    assert gaps == {900}
    assert points[-1][1] == pytest.approx(130 * 0.5 ** (8.5 / 5))


def test_latest_safe_drink_matches_caffeine_monitor():
    def at(hh, mm=0, day=24):
        return datetime(2026, 10, day, hh, mm, tzinfo=timezone.utc)

    for bed, cups, mg in [((23, 30), [((9, 0), 130), ((13, 15), 80)], 130),
                          ((3, 0), [((15, 0), 48), ((17, 0), 48)], 48),
                          ((22, 0), [], 130), ((22, 0), [((8, 0), 30)], 20)]:
        monitor = CaffeineMonitor(bed)
        for cup in cups:
            monitor.drink_cup(*cup)
        bedtime = at(*bed, day=25 if bed[0] < 12 else 24)
        drinks = [drink(at(*t), a) for t, a in cups]
        assert bedtime_mg(drinks, bedtime) == pytest.approx(monitor.caffeine_at_bedtime(monitor.cups))
        got = latest_safe_drink(drinks, bedtime, mg)
        assert (got.hour, got.minute) == monitor.latest_safe_drink(mg)


def test_latest_safe_drink_none_when_over_or_too_big():
    bedtime = datetime(2026, 10, 24, 23, tzinfo=timezone.utc)
    assert latest_safe_drink([drink(bedtime.replace(hour=20), 200)], bedtime, 80) is None      # already over 60 mg at bedtime
    assert latest_safe_drink([], bedtime, 60 * 2 ** 5) is None  # would need > 24 h to decay

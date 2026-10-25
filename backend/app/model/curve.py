"""M1: caffeine in the body and closed-form sleep exposure (§7.2, §7.3).

Same decay as backend/model.py's CaffeineMonitor, amount * 0.5 ** (hours / h),
with h a parameter and full timestamps so earlier days' drinks carry over.
"""
from datetime import datetime, timedelta, timezone
import math

from app.types import Drink

DEFAULT_H = 5.0  # population half-life, as in CaffeineMonitor


def _hours(a: datetime, b: datetime) -> float:
    # Via UTC: same-zone subtraction is wall-clock time and drifts an hour across DST.
    return (a.astimezone(timezone.utc) - b.astimezone(timezone.utc)).total_seconds() / 3600


def amount_at(drinks: list[Drink], t: datetime, h: float) -> float:
    return sum(d.mg * 0.5 ** (_hours(t, d.time) / h) for d in drinks if d.time <= t)


def curve(drinks: list[Drink], start: datetime, end: datetime, h: float,
          step_min: int = 15) -> list[tuple[datetime, float]]:
    # Step in UTC so the clocks-back hour is neither skipped nor doubled.
    points, t, stop = [], start.astimezone(timezone.utc), end.astimezone(timezone.utc)
    while t <= stop:
        local = t.astimezone(start.tzinfo)
        points.append((local, amount_at(drinks, local, h)))
        t += timedelta(minutes=step_min)
    return points


def sleep_exposure(drinks: list[Drink], bedtime: datetime, h: float, window_h: float = 3.0) -> float:
    """Mean of amount_at over [bedtime, bedtime + window_h], in mg."""
    k = math.log(2) / h
    total = 0.0
    for d in drinks:
        before = _hours(bedtime, d.time)
        if before >= 0:
            total += d.mg * math.exp(-k * before) * (1 - math.exp(-k * window_h)) / (k * window_h)
        elif -before < window_h:
            # Drunk during the window: only the part after drinking counts.
            total += d.mg * (1 - math.exp(-k * (window_h + before))) / (k * window_h)
    return total

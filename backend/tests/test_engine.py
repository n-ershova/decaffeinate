"""E1 runs in isolation until M1–M7 land; no substitute model ships in app/."""
from datetime import date, datetime, time, timedelta, timezone
import json
from time import perf_counter
from types import SimpleNamespace as NS
from zoneinfo import ZoneInfo

import numpy as np
import pytest

from app.services import engine
from app.types import Alcohol, Drink, Posterior, PosteriorSummary, SleepNight, User, WhatIf


class FakeRepo:
    def __init__(self):
        self.users = {1: User(id=1, name="You", bedtime=time(23, 30), smoker=False, hormonal_bc=False)}
        self.drinks = []
        self.alcohol = []
        self.nights = []

    def get_user(self, id):
        return self.users.get(id)

    def list_drinks(self, user_id, start, end):
        return [d for d in self.drinks if d.user_id == user_id and start <= d.time < end]

    def list_alcohol(self, user_id, start, end):
        return [a for a in self.alcohol if a.user_id == user_id and start <= a.time < end]

    def list_sleep(self, user_id):
        return [s for s in self.nights if s.user_id == user_id]


def drink(at, mg=80):
    return Drink(time=at, user_id=1, drink_key="red_bull", mg=mg,
                 mg_low=mg, mg_high=mg, source="preset")


@pytest.fixture
def setup(monkeypatch):
    calls = NS(fits=[], samples=[], decisions=[], leds=[], whatifs=[])
    def fit(prior, exposures, units, latencies):
        calls.fits.append((exposures(5), units.copy(), latencies.copy()))
        return Posterior(h_grid=np.array([3., 8.]), h_prob=np.array([.5, .5]),
                         m_N=np.ones((2, 3)) * len(latencies), S_N=np.ones((2, 3, 3)))
    def sample(post, n, rng):
        assert n == 500
        values = rng.normal(size=(n, 4))
        calls.samples.append(values.copy())
        return values
    def cutoff(*args):
        calls.decisions.append(args)
        return args[2] + timedelta(minutes=30)
    def led(*args):
        calls.leds.append(args)
        return "red" if args[5] >= 400 else "green"
    def whatif(*args):
        calls.whatifs.append(args)
        return WhatIf(median_min=9, low_min=4, high_min=17)
    def curve(drinks, start, end, h, step_min):
        assert step_min == 15
        calls.curve_end = end
        result = []
        while start <= end:
            result.append((start, sum(d.mg for d in drinks)))
            start += timedelta(minutes=step_min)
        return result
    models = NS(
        priors=NS(make_prior=lambda user: user),
        curve=NS(amount_at=lambda drinks, t, h: sum(d.mg for d in drinks), curve=curve,
                 sleep_exposure=lambda drinks, bedtime, h: sum(d.mg for d in drinks if d.time <= bedtime)),
        posterior=NS(fit=fit), sampling=NS(sample=sample, summarize=lambda p: PosteriorSummary(
            h_mean=5 + p.m_N[0, 0], h_sd=1, h_ci80=(3, 8), beta_mean=6, beta_sd=2,
            sensitivity_label="Average sensitivity")),
        decisions=NS(cutoff=cutoff), whatif=NS(whatif=whatif),
        led=NS(CAP_MG=400, led_state=led, safe_line_mg=lambda s, d: 38),
    )
    monkeypatch.setattr(engine, "_models", lambda: models)
    repo = FakeRepo()
    now = datetime(2026, 10, 24, 16, tzinfo=ZoneInfo("Europe/London"))
    return repo, engine.Engine(repo), now, calls, models


def test_state_local_today_residuals_future_and_seed(setup):
    repo, service, now, calls, _ = setup
    midnight = now.replace(hour=0)
    repo.drinks = [drink(midnight - timedelta(minutes=1)), drink(midnight),
                   drink(now), drink(now + timedelta(seconds=1))]
    result = service.state(1, now)
    assert set(result) == {"now_mg", "bedtime", "cutoff", "headline", "led", "daily_total_mg",
                           "cap_mg", "curve", "safe_line_mg", "is_simulated"}
    assert result["daily_total_mg"] == 160
    assert result["now_mg"] == 240
    assert result["cutoff"] == "16:30"
    assert result["bedtime"] == "23:30"
    assert len(calls.decisions[0][1]) == 3  # previous day's residual included
    assert result["curve"][0]["t"] == now.isoformat()
    assert calls.curve_end.hour == 8 and calls.curve_end.date() == now.date() + timedelta(days=1)
    json.dumps(result, allow_nan=False)
    service.state(1, now)
    np.testing.assert_array_equal(calls.samples[0], calls.samples[1])


def test_cap_blocks_cutoff_and_whatif_never_writes(setup):
    repo, service, now, calls, _ = setup
    repo.drinks = [drink(now, 400)]
    result = service.state(1, now)
    assert result["cutoff"] is None and result["led"] == "red"
    assert result["headline"] == "No more caffeine today" and not calls.decisions
    proposed = service.whatif(1, now, "black_tea", 45)
    assert proposed["cap_exceeded"] is True and proposed["led_after"] == "red"
    assert proposed["extra_latency_min"] == {"median": 9, "low": 4, "high": 17}
    assert len(repo.drinks) == 1
    assert calls.whatifs[-1][2].mg == 45
    json.dumps(proposed, allow_nan=False)


def test_profile_refits_every_prefix_with_correct_night_data(setup):
    repo, service, now, calls, _ = setup
    at = now - timedelta(days=2)
    repo.drinks = [drink(at - timedelta(hours=4)), drink(at + timedelta(days=1), 130)]
    repo.alcohol = [Alcohol(time=at, user_id=1, units=2)]
    repo.nights = [SleepNight(night=t.date(), user_id=1, bedtime=t, latency_min=15)
                   for t in (at + timedelta(days=1), at)]
    result = service.profile(1, now)
    assert [len(f[2]) for f in calls.fits] == [0, 1, 2]
    np.testing.assert_array_equal(calls.fits[-1][0], [80, 210])
    np.testing.assert_array_equal(calls.fits[-1][1], [2, 0])
    assert len(result["history"]) == 3
    assert result["history"][0]["night"] == (at.date() - timedelta(days=1)).isoformat()
    assert result["half_life"]["mean"] == 7
    assert result["population_mean_h"] == 5
    assert result["posterior"] == {"h_grid": [3, 8], "prob": [.5, .5]}
    json.dumps(result, allow_nan=False)


def test_cold_start_rollover_and_actual_bedtime(setup):
    repo, service, now, calls, _ = setup
    assert len(service.profile(1, now)["history"]) == 1
    late = now.replace(hour=23, minute=45)
    service.state(1, late)
    assert calls.decisions[-1][3].date() == now.date() + timedelta(days=1)
    actual = now.replace(hour=22)
    repo.nights = [SleepNight(night=now.date(), user_id=1, bedtime=actual, latency_min=15)]
    assert service.state(1, now)["bedtime"] == "22:00"
    # An upcoming bedtime is used for advice but not fitted as completed history.
    assert len(calls.fits[-1][2]) == 0


def test_dst_curve_end_and_local_midnight(setup):
    repo, service, _, calls, _ = setup
    now = datetime(2026, 10, 25, 0, 30, tzinfo=ZoneInfo("Europe/London"))
    repo.drinks = [drink(datetime(2026, 10, 24, 23, 15, tzinfo=timezone.utc))]
    result = service.state(1, now)
    assert result["daily_total_mg"] == 80  # 00:15 BST, despite previous UTC date
    assert calls.curve_end.utcoffset() == timedelta(0)


def test_invalid_user_time_and_amount(setup):
    _, service, now, _, _ = setup
    with pytest.raises(KeyError):
        service.state(999, now)
    with pytest.raises(ValueError):
        service.state(1, now.replace(tzinfo=None))
    for mg in (-1, float("inf"), float("nan")):
        with pytest.raises(ValueError):
            service.whatif(1, now, "red_bull", mg)


def test_orchestration_performance_budget_with_standins(setup):
    _, service, now, _, _ = setup
    start = perf_counter()
    service.state(1, now)
    assert perf_counter() - start < .2

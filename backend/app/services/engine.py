"""Orchestrates storage and the M1–M7 model contracts; returns JSON-safe dicts."""
from datetime import datetime, time, timedelta, timezone
from importlib import import_module
import math
from types import SimpleNamespace

import numpy as np

from app.db.repo import Repo
from app.types import Drink


def _models():
    # Lazy loading permits data/recognition work before model tickets land.
    return SimpleNamespace(**{name: import_module(f"app.model.{name}") for name in
                              ("curve", "priors", "posterior", "sampling", "decisions", "whatif", "led")})


class Engine:
    def __init__(self, repo: Repo):
        self.repo = repo

    def _load(self, user_id, now):
        if now.tzinfo is None or now.utcoffset() is None:
            raise ValueError("now must include a timezone offset")
        user = self.repo.get_user(user_id)
        if user is None:
            raise KeyError(user_id)
        start = datetime.min.replace(tzinfo=timezone.utc)
        end = now + timedelta(microseconds=1)
        drinks = self.repo.list_drinks(user_id, start, end)
        alcohol = self.repo.list_alcohol(user_id, start, end)
        checkins = self.repo.list_sleep(user_id)
        nights = sorted([s for s in checkins if s.bedtime <= now],
                        key=lambda s: s.night)
        today_start = datetime.combine(now.date(), time(), now.tzinfo)
        today = [d for d in drinks if today_start <= d.time <= now]
        bedtime = datetime.combine(now.date(), user.bedtime, now.tzinfo)
        if bedtime <= now:
            bedtime += timedelta(days=1)
        # A recorded actual bedtime overrides the scheduled one for that night.
        bedtime = next((s.bedtime.astimezone(now.tzinfo) for s in checkins
                        if s.night == bedtime.date() and s.bedtime > now), bedtime)
        return user, drinks, alcohol, nights, today, bedtime

    @staticmethod
    def _fit(m, user, drinks, alcohol, nights):
        def exposures(h):
            return np.array([m.curve.sleep_exposure(drinks, s.bedtime, h) for s in nights])
        # Attribute alcohol to the local calendar day named by each check-in.
        units = np.array([sum(a.units for a in alcohol
                              if a.time.astimezone(s.bedtime.tzinfo).date() == s.night)
                          for s in nights])
        latency = np.array([s.latency_min for s in nights])
        return m.posterior.fit(m.priors.make_prior(user), exposures, units, latency)

    @staticmethod
    def _curve(m, drinks, now, h):
        end = datetime.combine(now.date(), time(8), now.tzinfo)
        if end <= now:
            end += timedelta(days=1)
        return [{"t": t.isoformat(), "mg": float(mg)} for t, mg in
                m.curve.curve(drinks, now, end, h, step_min=15)]

    def curve(self, user_id: int, now: datetime, std_mg: float = 130, drink_label: str = "coffee") -> dict:
        """GET /curve: needs only M1, at the population half-life until M3 learns one.

        The cutoff and LED follow backend/model.py's CaffeineMonitor: at most
        THRESHOLD_MG in the body at bedtime.
        """
        _, drinks, _, _, _, bedtime = self._load(user_id, now)
        m = SimpleNamespace(curve=import_module("app.model.curve"))
        h = m.curve.DEFAULT_H
        cutoff = m.curve.latest_safe_drink(drinks, bedtime, std_mg, h)
        if cutoff is not None and cutoff <= now:
            cutoff = None  # the safe window has already closed
        cutoff_text = cutoff.astimezone(now.tzinfo).strftime("%H:%M") if cutoff else None
        # Green: another one now is still safe; amber: safe so far; red: over at bedtime.
        if m.curve.bedtime_mg(drinks, bedtime, h) > m.curve.THRESHOLD_MG:
            led = "red"
        else:
            led = "green" if cutoff else "amber"
        return {"now_mg": float(m.curve.amount_at(drinks, now, h)), "h": h,
                "curve": self._curve(m, drinks, now, h),
                "bedtime": bedtime.strftime("%H:%M"), "cutoff": cutoff_text,
                "headline": f"Last {drink_label} today by {cutoff_text}" if cutoff else "No more caffeine today",
                "led": led, "safe_line_mg": float(m.curve.THRESHOLD_MG)}

    def state(self, user_id: int, now: datetime, std_mg: float = 130, drink_label: str = "coffee") -> dict:
        user, drinks, alcohol, nights, today, bedtime = self._load(user_id, now)
        m = _models()
        post = self._fit(m, user, drinks, alcohol, nights)
        samples = m.sampling.sample(post, 500, np.random.default_rng(0))
        summary = m.sampling.summarize(post)
        total = float(sum(d.mg for d in today))
        # Decisions need previous-day residual caffeine too, whereas the cap
        # only counts doses since local midnight.
        cutoff = m.decisions.cutoff(samples, drinks, now, bedtime, user.tolerance_min,
                                    m.curve.sleep_exposure, std_mg=std_mg) if total < m.led.CAP_MG else None
        cutoff_text = cutoff.astimezone(now.tzinfo).strftime("%H:%M") if cutoff else None
        return {"now_mg": float(m.curve.amount_at(drinks, now, summary.h_mean)),
                "bedtime": bedtime.strftime("%H:%M"), "cutoff": cutoff_text,
                "headline": f"Last {drink_label} today by {cutoff_text}" if cutoff else "No more caffeine today",
                "led": m.led.led_state(samples, drinks, now, bedtime, user.tolerance_min,
                                       total, m.curve.sleep_exposure),
                "daily_total_mg": total, "cap_mg": m.led.CAP_MG,
                "curve": self._curve(m, drinks, now, summary.h_mean),
                "safe_line_mg": float(m.led.safe_line_mg(samples, user.tolerance_min)),
                "is_simulated": user.is_simulated}

    def whatif(self, user_id: int, now: datetime, drink_key: str, mg: float) -> dict:
        if not math.isfinite(mg) or mg < 0:
            raise ValueError("mg must be finite and nonnegative")
        user, drinks, alcohol, nights, today, bedtime = self._load(user_id, now)
        m = _models()
        post = self._fit(m, user, drinks, alcohol, nights)
        samples = m.sampling.sample(post, 500, np.random.default_rng(0))
        summary = m.sampling.summarize(post)
        proposed = Drink(time=now, user_id=user_id, drink_key=drink_key, mg=mg,
                         mg_low=mg, mg_high=mg, source="preset")
        prediction = m.whatif.whatif(samples, drinks, proposed, bedtime, m.curve.sleep_exposure)
        after = drinks + [proposed]
        total = sum(d.mg for d in today) + mg
        return {"extra_latency_min": {"median": float(prediction.median_min),
                                      "low": float(prediction.low_min), "high": float(prediction.high_min)},
                "curve": self._curve(m, after, now, summary.h_mean),
                "led_after": m.led.led_state(samples, after, now, bedtime, user.tolerance_min,
                                             total, m.curve.sleep_exposure),
                "cap_exceeded": total > m.led.CAP_MG}

    def profile(self, user_id: int, now: datetime) -> dict:
        user, drinks, alcohol, nights, _, _ = self._load(user_id, now)
        m = _models()
        history = []
        post = None
        for n in range(len(nights) + 1):
            post = self._fit(m, user, drinks, alcohol, nights[:n])
            summary = m.sampling.summarize(post)
            day = nights[n - 1].night if n else (nights[0].night - timedelta(days=1) if nights else now.date())
            history.append({"night": day.isoformat(), "h_mean": float(summary.h_mean),
                            "h_low": float(summary.h_ci80[0]), "h_high": float(summary.h_ci80[1])})
        return {"half_life": {"mean": float(summary.h_mean), "sd": float(summary.h_sd),
                              "ci80": [float(v) for v in summary.h_ci80]},
                "population_mean_h": 5,
                "sensitivity": {"mean": float(summary.beta_mean), "sd": float(summary.beta_sd),
                                "label": summary.sensitivity_label},
                "posterior": {"h_grid": post.h_grid.tolist(), "prob": post.h_prob.tolist()},
                "history": history, "checkins": [s.model_dump(mode="json") for s in nights]}


def simulate_history(user, true_h, true_beta, start, days, seed):
    """D9 adapter; keep model imports centralized in the engine service."""
    simulator = import_module("app.model.simulate")
    curve_model = import_module("app.model.curve")
    return simulator.simulate_user(user, true_h, true_beta, start, days, seed,
                                   exposure_fn=curve_model.sleep_exposure)

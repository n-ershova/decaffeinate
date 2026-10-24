from copy import deepcopy
from datetime import datetime
from zoneinfo import ZoneInfo
import pytest
from fastapi.testclient import TestClient
from app.db.memory_repo import MemoryRepo
from app.deps import get_engine, get_now, get_repo
from app.main import app

STATE = {"now_mg":142, "bedtime":"23:30", "cutoff":"14:10",
         "headline":"Last coffee today by 14:10", "led":"amber",
         "daily_total_mg":195, "cap_mg":400,
         "curve":[{"t":"2026-10-24T16:00:00+01:00","mg":142}],
         "safe_line_mg":38, "is_simulated":False}
PROFILE = {"half_life":{"mean":7.1,"sd":1,"ci80":[5.8,8.4]}, "population_mean_h":5,
           "sensitivity":{"mean":6.2,"sd":2.1,"label":"Average sensitivity"},
           "posterior":{"h_grid":list(range(1,201)),"prob":[1/200]*200},
           "history":[{"night":"2026-10-03","h_mean":5,"h_low":2.6,"h_high":9.4}], "checkins":[]}

class FakeEngine:
    def state(self, user_id, now):
        if user_id == 999: raise KeyError(user_id)
        return deepcopy(STATE)
    def profile(self, user_id, now):
        if user_id == 999: raise KeyError(user_id)
        return deepcopy(PROFILE)
    def whatif(self, user_id, now, drink_key, mg):
        if user_id == 999: raise KeyError(user_id)
        return {"extra_latency_min":{"median":9,"low":4,"high":17},
                "curve":deepcopy(STATE["curve"]), "led_after":"red", "cap_exceeded":False}

@pytest.fixture
def now():
    return datetime(2026,10,24,16,tzinfo=ZoneInfo("Europe/London"))

@pytest.fixture
def api_repo():
    return MemoryRepo()

@pytest.fixture
def api_engine():
    return FakeEngine()

@pytest.fixture
def client(api_repo, api_engine, now):
    app.dependency_overrides[get_repo] = lambda: api_repo
    app.dependency_overrides[get_now] = lambda: now
    app.dependency_overrides[get_engine] = lambda: api_engine
    with TestClient(app) as value:
        yield value
    app.dependency_overrides.clear()

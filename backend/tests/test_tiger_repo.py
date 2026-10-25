from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, time, timedelta, timezone

import pytest

import os
import uuid
from pathlib import Path

from dotenv import dotenv_values
import psycopg
from psycopg import sql
from psycopg.conninfo import make_conninfo

from app.db.tiger_repo import TigerRepo
from app.types import Alcohol, Drink, HrCheck, SleepNight, User


@pytest.fixture
def repo():
    url = os.environ.get("DATABASE_URL") or dotenv_values(
        Path(__file__).resolve().parents[2] / ".env").get("DATABASE_URL")
    if not url:
        pytest.skip("DATABASE_URL not set: Tiger Data integration test")
    schema = "test_repo_" + uuid.uuid4().hex
    with psycopg.connect(url, autocommit=True) as conn:
        # Install once in public, never inside a schema the fixture deletes.
        conn.execute("CREATE EXTENSION IF NOT EXISTS timescaledb WITH SCHEMA public")
        conn.execute(sql.SQL("CREATE SCHEMA {}").format(sql.Identifier(schema)))
    isolated = make_conninfo(url, options=f"-csearch_path={schema},public")
    try:
        with psycopg.connect(isolated, autocommit=True) as conn:
            ddl = (Path(__file__).resolve().parents[1] / "app/db/schema.sql").read_text()
            # Verify that the complete D3 setup is idempotent.
            conn.execute(ddl, prepare=False)
            conn.execute(ddl, prepare=False)
        with TigerRepo(isolated) as result:
            result.create_user(user(1).model_copy(update={"name": "You"}))
            yield result
    finally:
        with psycopg.connect(url, autocommit=True) as conn:
            conn.execute(sql.SQL("DROP SCHEMA {} CASCADE").format(sql.Identifier(schema)))


def user(id=2):
    return User(id=id, name="Test", bedtime=time(23, 30), smoker=False, hormonal_bc=False)


def drink(id, at, mg=80):
    return Drink(user_id=id, time=at, drink_key="red_bull", mg=mg,
                 mg_low=mg, mg_high=mg, source="preset")


def test_users(repo):
    assert repo.get_user(999) is None
    assert repo.create_user(user()).id == 2
    assert repo.create_user(user(0)).id > 2
    assert [u.id for u in repo.list_users()] == sorted(u.id for u in repo.list_users())
    updated = repo.update_user(2, bedtime="22:00", tolerance_min=5)
    assert updated.bedtime == time(22) and updated.tolerance_min == 5
    assert repo.update_user(2) == updated
    updated.name = "changed outside repo"
    assert repo.get_user(2).name == "Test"
    with pytest.raises(ValueError):
        repo.create_user(user())
    with pytest.raises(KeyError):
        repo.update_user(999, name="missing")
    with pytest.raises(TypeError):
        repo.update_user(2, id=3)
    with pytest.raises(ValueError):
        repo.update_user(2, bogus=True)


def test_logs_ranges_totals_and_isolation(repo):
    repo.create_user(user())
    repo.create_user(user(3))
    start = datetime(2026, 10, 24, tzinfo=timezone.utc)
    repo.add_drink(drink(2, start + timedelta(hours=2)))
    repo.add_drink(drink(2, start, 130))
    repo.add_drink(drink(2, start + timedelta(days=1), 10))
    repo.add_drink(drink(3, start, 200))
    assert [d.mg for d in repo.list_drinks(2, start, start + timedelta(days=1))] == [130, 80]
    assert repo.daily_total_mg(2, start.date()) == 210
    assert repo.daily_total_mg(2, date(2020, 1, 1)) == 0
    returned = repo.list_drinks(2, start, start + timedelta(days=1))[0]
    returned.mg = 999
    assert repo.daily_total_mg(2, start.date()) == 210
    a = Alcohol(time=start, user_id=2, units=2)
    assert repo.add_alcohol(a) == a
    assert repo.list_alcohol(2, start, start + timedelta(days=1)) == [a]
    assert repo.list_alcohol(3, start, start + timedelta(days=1)) == []
    h = HrCheck(time=start, user_id=2, drink_time=None, hr_bpm=70, br_bpm=14)
    assert repo.add_hr(h) == h
    with pytest.raises(KeyError):
        repo.add_drink(drink(999, start))


def test_sleep_upsert_and_reset(repo):
    repo.create_user(user())
    at = datetime(2026, 10, 24, tzinfo=timezone.utc)
    s = SleepNight(night=at.date(), user_id=2, bedtime=at, latency_min=15)
    assert repo.upsert_sleep(s) == s
    repo.upsert_sleep(s.model_copy(update={"latency_min": 30}))
    assert len(repo.list_sleep(2)) == 1 and repo.list_sleep(2)[0].latency_min == 30
    repo.add_drink(drink(2, at))
    repo.add_alcohol(Alcohol(time=at, user_id=2, units=1))
    repo.add_hr(HrCheck(time=at, user_id=2, drink_time=at, hr_bpm=70, br_bpm=15))
    repo.reset_user(2)
    assert repo.get_user(2) is not None
    assert repo.list_sleep(2) == []
    assert repo.list_alcohol(2, at, at + timedelta(days=1)) == []
    assert repo.daily_total_mg(2, at.date()) == 0
    repo.reset_user(999)


def test_default_user_and_thread_safety(repo):
    assert repo.get_user(1).name == "You"
    assert repo.get_user(1).bedtime == time(23, 30)
    with ThreadPoolExecutor(max_workers=8) as pool:
        ids = list(pool.map(lambda _: repo.create_user(user(0)).id, range(80)))
    assert len(set(ids)) == 80
    at = datetime(2026, 10, 24, tzinfo=timezone.utc)
    with ThreadPoolExecutor(max_workers=8) as pool:
        list(pool.map(lambda _: repo.add_drink(drink(1, at, 1)), range(100)))
    assert repo.daily_total_mg(1, at.date()) == 100


def test_materialized_history_reset(repo):
    repo.create_user(user())
    at = datetime(2026, 1, 2, tzinfo=timezone.utc)
    repo.add_drink(drink(2, at))
    with repo.pool.connection() as conn:
        conn.autocommit = True
        conn.execute("CALL refresh_continuous_aggregate('daily_caffeine', %s::timestamptz, %s::timestamptz)",
                     (at, at + timedelta(days=1)))
        conn.autocommit = False
    assert repo.daily_total_mg(2, at.date()) == 80
    repo.reset_user(2)
    assert repo.daily_total_mg(2, at.date()) == 0


def test_delete_drinks_and_sleep(repo):
    repo.create_user(user())
    repo.create_user(user(3))
    at = datetime(2026, 10, 20, 9, tzinfo=timezone.utc)
    for id in (2, 3):
        repo.add_drink(drink(id, at))
        repo.add_drink(drink(id, at + timedelta(hours=1)))
        repo.upsert_sleep(SleepNight(night=at.date(), user_id=id, bedtime=at, latency_min=15))
    assert repo.delete_drinks(2, [at, at - timedelta(days=1)]) == 1
    assert repo.delete_drinks(2, []) == 0
    window = (at - timedelta(days=1), at + timedelta(days=1))
    assert [d.time for d in repo.list_drinks(2, *window)] == [at + timedelta(hours=1)]
    assert len(repo.list_drinks(3, *window)) == 2
    assert repo.daily_total_mg(2, at.date()) == 80
    assert repo.delete_sleep(2, [at.date(), date(2026, 1, 1)]) == 1
    assert repo.list_sleep(2) == [] and len(repo.list_sleep(3)) == 1

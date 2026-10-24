from datetime import datetime, timedelta
import pytest
from app.routes import demo
from app.types import Drink, SimHistory, SleepNight, User

@pytest.fixture
def simulator(monkeypatch):
    calls=[]
    def simulate(user, true_h, true_beta, start, days, seed):
        calls.append((user.id,true_h,true_beta,start,days,seed))
        drinks=[]; nights=[]
        for day in range(days):
            date=start+timedelta(days=day)
            at=datetime.combine(date,user.bedtime).astimezone()
            drinks.append(Drink(time=at-timedelta(hours=8),user_id=user.id,drink_key="milk_coffee",
                                mg=130,mg_low=100,mg_high=200,source="simulated"))
            nights.append(SleepNight(night=date,user_id=user.id,bedtime=at,latency_min=15+true_h))
        return SimHistory(user=user,true_h=true_h,true_beta=true_beta,drinks=drinks,alcohol=[],nights=nights)
    monkeypatch.setattr(demo,"simulate_user",simulate)
    return calls

def test_seed_twice_is_idempotent(client,api_repo,simulator):
    for _ in range(2):
        response=client.post("/demo/seed")
        assert response.status_code == 200
        assert response.json()["users"] == [
            {"id":2,"name":"Sam (fast, h=3)","true_h":3},
            {"id":3,"name":"Alex (slow, h=8)","true_h":8}]
    assert len([u for u in api_repo.list_users() if u.is_simulated]) == 2
    assert len(api_repo._drinks) == 42 and len(api_repo.list_sleep(2)) == 21
    assert {call[2] for call in simulator} == {6}
    assert {call[-1] for call in simulator} == {42}
    assert {call[-2] for call in simulator} == {21}

def test_seed_preserves_real_user(client,api_repo,simulator):
    api_repo.create_user(User(id=2,name="Real user",bedtime="23:00",smoker=False,hormonal_bc=False))
    assert client.post("/demo/seed").status_code == 409
    assert api_repo.get_user(2).name == "Real user" and api_repo.get_user(3) is None

def test_missing_model_does_not_mutate_data(client,api_repo,monkeypatch):
    def missing(*args,**kwargs):
        raise ModuleNotFoundError("No model",name="app.model")
    monkeypatch.setattr(demo,"simulate_user",missing)
    assert client.post("/demo/seed").status_code == 503
    assert len(api_repo.list_users()) == 1

def test_sql_export(simulator,now):
    data=demo.histories(now)
    data[0].user.name="Sam's demo"
    sql=demo.seed_sql(data)
    assert "Sam''s demo" in sql
    assert sql.count("INSERT INTO sleep_nights") == 42
    assert sql.count("INSERT INTO drinks") == 42
    assert "DELETE FROM hr_checks WHERE user_id=2;" in sql
    assert "CALL refresh_continuous_aggregate" in sql


def test_standalone_sql_on_tiger():
    import os, uuid
    from pathlib import Path
    from dotenv import dotenv_values
    import psycopg
    from psycopg import sql
    from psycopg.conninfo import make_conninfo
    root=Path(__file__).resolve().parents[2]
    url=os.environ.get("DATABASE_URL") or dotenv_values(root/".env").get("DATABASE_URL")
    if not url:
        pytest.skip("DATABASE_URL not set")
    schema="test_seed_"+uuid.uuid4().hex
    with psycopg.connect(url,autocommit=True,connect_timeout=10) as conn:
        conn.execute(sql.SQL("CREATE SCHEMA {}").format(sql.Identifier(schema)))
    isolated=make_conninfo(url,options=f"-csearch_path={schema},public")
    try:
        with psycopg.connect(isolated,autocommit=True,connect_timeout=10) as conn:
            conn.execute((root/"backend/app/db/schema.sql").read_text(encoding="utf-8"),prepare=False)
            seed=(root/"data/seed_demo.sql").read_text(encoding="utf-8")
            transaction,refresh=seed.rsplit("CALL refresh_continuous_aggregate",1)
            for _ in range(2):
                conn.execute(transaction,prepare=False)
                conn.execute("CALL refresh_continuous_aggregate"+refresh,prepare=False)
            assert conn.execute("SELECT count(*) FROM users WHERE is_simulated").fetchone()[0] == 2
            assert conn.execute("SELECT count(*) FROM drinks").fetchone()[0] == 84
            assert conn.execute("SELECT count(*) FROM sleep_nights").fetchone()[0] == 42
            assert conn.execute("SELECT count(*) FROM daily_caffeine").fetchone()[0] == 42
    finally:
        with psycopg.connect(url,autocommit=True,connect_timeout=10) as conn:
            conn.execute(sql.SQL("DROP SCHEMA {} CASCADE").format(sql.Identifier(schema)))

from datetime import timedelta, timezone
import pytest

DRINK={"drink_key":"milk_coffee","mg":130,"mg_low":100,"mg_high":200,"source":"preset"}

def test_drinks_defaults_ranges_and_isolation(client,api_repo,now):
    value=client.post("/drinks",json=DRINK)
    assert value.status_code == 200
    assert value.json()["time"] == now.isoformat()
    assert value.json()["user_id"] == 1
    assert len(client.get("/drinks").json()) == 1
    old={**DRINK,"time":(now-timedelta(days=15)).isoformat()}
    client.post("/drinks",json=old)
    assert len(client.get("/drinks").json()) == 1
    assert len(client.get("/drinks?days=30").json()) == 2
    assert client.get("/drinks?user_id=999").status_code == 404
    assert client.post("/drinks",json={**DRINK,"user_id":999}).status_code == 404

@pytest.mark.parametrize("updates",[{"mg":-1},{"mg_low":150},{"time":"2026-10-24T12:00:00"},{"source":"bad"},{"drink_key":"invented"}])
def test_invalid_drinks(client,updates):
    assert client.post("/drinks",json={**DRINK,**updates}).status_code == 422

def test_alcohol_and_sleep_upsert(client,api_repo,now):
    assert client.post("/alcohol",json={"units":2}).json()["time"] == now.isoformat()
    assert api_repo.list_alcohol(1,now-timedelta(seconds=1),now+timedelta(seconds=1))[0].units == 2
    body={"night":"2026-10-23","bedtime":"2026-10-23T23:30:00+01:00","latency_min":15,"rested_1to5":4}
    assert client.post("/sleep",json=body).status_code == 200
    assert client.post("/sleep",json={**body,"latency_min":25}).json()["latency_min"] == 25
    assert len(api_repo.list_sleep(1)) == 1
    client.post("/sleep",json={**body,"night":"2026-10-22","bedtime":"2026-10-22T23:30:00+01:00"})
    assert [s["night"] for s in client.get("/sleep").json()] == ["2026-10-23","2026-10-22"]
    assert client.get("/sleep?user_id=999").status_code == 404
    assert client.post("/sleep",json={**body,"rested_1to5":6}).status_code == 422
    assert client.post("/alcohol",json={"units":-1}).status_code == 422

def test_pending_checkin_at_local_five(client,now):
    from app.main import app
    from app.deps import get_now
    app.dependency_overrides[get_now]=lambda: now.replace(hour=4,minute=59)
    assert client.get("/sleep/pending").json() == {"needs_checkin":False,"night":"2026-10-23"}
    app.dependency_overrides[get_now]=lambda: now.replace(hour=5,minute=0)
    assert client.get("/sleep/pending").json()["needs_checkin"] is True
    client.post("/sleep",json={"night":"2026-10-23","bedtime":"2026-10-24T00:30:00+01:00","latency_min":15})
    assert client.get("/sleep/pending").json()["needs_checkin"] is False

def test_presets_are_serving_estimates(client):
    values=client.get("/presets").json()
    assert len(values) == 22
    coffee=next(p for p in values if p["key"]=="milk_coffee")
    assert coffee["mg"] == 130 and coffee["mg_low"] == 100
    assert next(p for p in values if p["key"]=="mocha")["mg"] == 140

def test_delete_drinks_and_sleep(client,api_repo,now):
    kept=client.post("/drinks",json={**DRINK,"time":(now-timedelta(hours=2)).isoformat()}).json()
    gone=client.post("/drinks",json=DRINK).json()
    # Same instant written with another offset still matches.
    utc=now.astimezone(timezone.utc).isoformat()
    assert client.request("DELETE","/drinks",json={"times":[utc]}).json() == {"deleted":1}
    assert client.get("/drinks").json() == [kept]
    assert client.request("DELETE","/drinks",json={"times":[gone["time"]]}).json() == {"deleted":0}
    assert client.request("DELETE","/drinks",json={"user_id":999,"times":[]}).status_code == 404
    assert client.request("DELETE","/drinks",json={"times":["2026-10-24T12:00:00"]}).status_code == 422
    body={"bedtime":"2026-10-23T23:30:00+01:00","latency_min":15}
    for night in ("2026-10-22","2026-10-23"):
        client.post("/sleep",json={**body,"night":night})
    assert client.request("DELETE","/sleep",json={"nights":["2026-10-23","2026-10-01"]}).json() == {"deleted":1}
    assert [s["night"] for s in client.get("/sleep").json()] == ["2026-10-22"]
    assert client.request("DELETE","/sleep",json={"user_id":999,"nights":[]}).status_code == 404

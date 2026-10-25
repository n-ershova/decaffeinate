import pytest
from app.routes import machine

@pytest.fixture(autouse=True)
def fresh(monkeypatch):
    monkeypatch.setattr(machine, "_last_seen", None)

def test_never_seen(client):
    assert client.get("/machine").json() == {"online": False, "last_seen": None, "seconds_ago": None}

def test_heartbeat_marks_online(client):
    assert client.post("/machine/heartbeat").json() == {"ok": True}
    body = client.get("/machine").json()
    assert body["online"] is True and body["seconds_ago"] < 1 and body["last_seen"]

def test_goes_offline_after_missed_beats(client, monkeypatch):
    client.post("/machine/heartbeat")
    monkeypatch.setattr(machine, "time", lambda: machine._last_seen + machine.ONLINE_WITHIN_S + 1)
    body = client.get("/machine").json()
    assert body["online"] is False and body["seconds_ago"] == machine.ONLINE_WITHIN_S + 1

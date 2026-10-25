import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.routes import machine_log

@pytest.fixture(autouse=True)
def fresh(monkeypatch):
    monkeypatch.setattr(machine_log, "_logs", {})

def test_entries_are_read_after_a_seq(client):
    first = client.post("/machine/log", json={"kind": "track", "message": "#1 cup appeared"}).json()["seq"]
    client.post("/machine/log", json={"kind": "logged", "message": "logged Oat latte: 130 mg"})
    body = client.get("/machine/log").json()
    assert [e["kind"] for e in body["entries"]] == ["track", "logged"] and body["last"] > first
    later = client.get(f"/machine/log?after={first}").json()
    assert [e["message"] for e in later["entries"]] == ["logged Oat latte: 130 mg"]
    assert client.get(f"/machine/log?after={body['last']}").json() == {"entries": [], "last": body["last"]}

def test_reset_log_reports_a_lower_last(client):
    # After a backend restart the page still asks with its old seq.
    assert client.get("/machine/log?after=50").json() == {"entries": [], "last": 0}

def test_keeps_only_the_newest(client):
    for i in range(machine_log.KEEP + 5):
        client.post("/machine/log", json={"kind": "info", "message": f"m{i}"})
    entries = client.get("/machine/log").json()["entries"]
    assert len(entries) == machine_log.KEEP and entries[-1]["message"] == f"m{machine_log.KEEP + 4}"

@pytest.mark.parametrize("body", [{"kind": "bad", "message": "x"}, {"kind": "info", "message": ""},
                                  {"kind": "info", "message": "x" * 201}])
def test_invalid_entries(client, body):
    assert client.post("/machine/log", json=body).status_code == 422

def test_unknown_user(client):
    assert client.get("/machine/log?user_id=999").status_code == 404

def test_needs_sign_in():
    # Entries name the drinks someone held up, so unlike /machine they are private.
    with TestClient(app) as anonymous:
        assert anonymous.get("/machine/log").status_code == 401
        assert anonymous.post("/machine/log", json={"kind": "info", "message": "x"}).status_code == 401

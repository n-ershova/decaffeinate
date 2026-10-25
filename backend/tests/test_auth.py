from datetime import datetime, timedelta, timezone
import hashlib

import pytest
from fastapi.testclient import TestClient
from app.auth import COOKIE, get_auth_store
from app.deps import get_engine, get_now, get_repo
from app.main import app

@pytest.fixture
def secured_client(api_repo, api_engine, now):
    app.dependency_overrides[get_repo] = lambda: api_repo
    app.dependency_overrides[get_engine] = lambda: api_engine
    app.dependency_overrides[get_now] = lambda: now
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()

def register(client, email="alice@example.test"):
    return client.post("/auth/register", json={
        "email": email, "password": "test-password-123!", "name": "Alice",
        "bedtime": "23:00", "smoker": False, "hormonal_bc": False,
    })

def drink(user_id):
    return {"user_id": user_id, "drink_key": "espresso_shot", "mg": 65,
            "mg_low": 50, "mg_high": 100, "source": "text"}

def test_two_accounts_have_separate_history_and_cannot_change_owner(secured_client):
    c = secured_client
    a = register(c).json()["id"]
    assert c.post("/drinks", json=drink(a)).status_code == 200
    assert len(c.get(f"/drinks?user_id={a}").json()) == 1
    assert c.post("/auth/logout").status_code == 200
    b = register(c, "bob@example.test").json()["id"]
    assert a != b
    assert c.get(f"/drinks?user_id={b}").json() == []
    assert c.get(f"/drinks?user_id={a}").status_code == 403
    assert c.post("/drinks", json=drink(a)).status_code == 403
    assert c.request("DELETE", "/drinks", json={"user_id": a, "times": []}).status_code == 403
    assert c.post("/drinks/identify", data={"user_id": a, "source": "text", "text": "espresso"}).status_code == 403
    assert c.post("/auth/login", json={"email": "ALICE@example.test", "password": "test-password-123!"}).status_code == 200
    assert c.get("/auth/me").json()["id"] == a
    assert len(c.get(f"/drinks?user_id={a}").json()) == 1
    assert c.get(f"/drinks?user_id={b}").status_code == 403

@pytest.mark.parametrize("path", ["/drinks", "/sleep", "/sleep/pending", "/state", "/curve", "/profile", "/brief", "/users/1"])
def test_private_endpoints_require_login(secured_client, path):
    assert secured_client.get(path).status_code == 401

@pytest.mark.parametrize("path", ["/sleep?user_id=1", "/sleep/pending?user_id=1", "/state?user_id=1", "/curve?user_id=1", "/profile?user_id=1", "/brief?user_id=1", "/users/1"])
def test_all_personal_reads_enforce_ownership(secured_client, path):
    assert register(secured_client).status_code == 200
    assert secured_client.get(path).status_code == 403

def test_passwords_sessions_expiry_and_logout(secured_client, api_repo):
    c = secured_client
    response = register(c)
    assert response.status_code == 200
    assert "httponly" in response.headers["set-cookie"].lower()
    assert "samesite=strict" in response.headers["set-cookie"].lower()
    assert response.headers["cache-control"] == "no-store"
    store = get_auth_store(api_repo)
    assert store.accounts["alice@example.test"][1] != "test-password-123!"
    token = c.cookies.get(COOKIE)
    assert token not in store.sessions
    assert c.post("/auth/login", json={"email": "alice@example.test", "password": "wrong-password-123"}).status_code == 401
    assert c.post("/auth/login", json={"email": "absent@example.test", "password": "wrong-password-123"}).status_code == 401
    assert register(c).status_code == 409
    assert c.post("/auth/logout").status_code == 200
    c.cookies.set(COOKIE, token)
    assert c.get("/auth/me").status_code == 401
    c.cookies.clear()
    assert c.post("/auth/login", json={"email": "alice@example.test", "password": "test-password-123!"}).status_code == 200
    token = c.cookies.get(COOKIE)
    digest = hashlib.sha256(token.encode()).hexdigest()
    user_id, _ = store.sessions[digest]
    store.sessions[digest] = (user_id, datetime.now(timezone.utc) - timedelta(seconds=1))
    assert c.get("/auth/me").status_code == 401

def test_csrf_weak_password_and_rate_limit(secured_client, api_repo):
    c = secured_client
    assert c.post("/auth/login", headers={"Origin": "https://untrusted.example"},
                  json={"email": "alice@example.test", "password": "test-password-123!"}).status_code == 403
    assert c.post("/auth/login", json={"email": "alice@example.test", "password": "short"}).status_code == 422
    from time import monotonic
    get_auth_store(api_repo).attempts["testclient"] = [monotonic()] * 30
    assert c.post("/auth/login", json={"email": "alice@example.test", "password": "wrong-password-123"}).status_code == 429

def test_cannot_create_or_switch_arbitrary_profiles(secured_client):
    c = secured_client
    assert register(c).status_code == 200
    assert c.post("/users", json={"name": "Other", "bedtime": "23:00"}).status_code == 403
    assert c.patch("/users/1", json={"bedtime": "22:00"}).status_code == 403
    assert c.post("/demo/seed").status_code == 403

def test_recognized_drink_uses_signed_in_profile(secured_client, monkeypatch):
    from app.routes import identify
    from app.types import GeminiResult
    monkeypatch.setattr(identify, "identify_text", lambda text: GeminiResult(drink="red_bull", confidence=.95))
    c = secured_client
    user_id = register(c).json()["id"]
    response = c.post("/drinks/identify", data={"user_id": user_id, "text": "Red Bull", "source": "text"})
    assert response.status_code == 200
    assert response.json()["logged"]["user_id"] == user_id
    assert len(c.get(f"/drinks?user_id={user_id}").json()) == 1

def test_registration_retains_password_spaces(secured_client):
    c = secured_client
    body = {"email": "spaces@example.test", "password": "  test-password-123!  ",
            "name": "  Alice  ", "bedtime": "23:00"}
    assert c.post("/auth/register", json=body).status_code == 200
    assert c.post("/auth/logout").status_code == 200
    assert c.post("/auth/login", json={"email": body["email"], "password": body["password"]}).status_code == 200

def test_device_presence_works_without_exposing_personal_history(secured_client):
    c = secured_client
    assert c.post("/machine/heartbeat").status_code == 200
    assert c.get("/machine").json()["online"] is True
    assert c.get("/drinks?user_id=1").status_code == 401

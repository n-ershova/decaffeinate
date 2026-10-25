import httpx
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.routes import announce

@pytest.fixture
def speech(monkeypatch, tmp_path):
    settings = {"ELEVENLABS_API_KEY": "fake-key", "ANNOUNCE_CACHE_DIR": str(tmp_path)}
    monkeypatch.setattr(announce, "setting", lambda name, default="": settings.get(name, default))
    class Speech:
        posts = []
        status = 200
        async def __aenter__(self): return self
        async def __aexit__(self, *args): pass
        async def post(self, url, **kwargs):
            self.posts.append((url, kwargs))
            return httpx.Response(self.status, content=b"ID3test-mp3", headers={"content-type": "audio/mpeg"},
                                  request=httpx.Request("POST", url))
    fake = Speech()
    monkeypatch.setattr(announce.httpx, "AsyncClient", lambda **kwargs: fake)
    return fake, settings

COKE = {"drink": "Coca-Cola 330 ml can", "mg": 32}

def test_speaks_the_drink_and_caffeine_and_caches_it(client, speech):
    fake, _ = speech
    for _ in range(2):
        response = client.post("/machine/announce", json=COKE)
        assert response.status_code == 200 and response.content == b"ID3test-mp3"
        assert response.headers["content-type"].startswith("audio/mpeg")
    assert len(fake.posts) == 1
    url, kwargs = fake.posts[0]
    assert url.startswith("https://api.elevenlabs.io/v1/text-to-speech/")
    assert kwargs["headers"]["xi-api-key"] == "fake-key"
    assert kwargs["json"]["text"] == "Logged Coca-Cola 330 ml can. 32 milligrams of caffeine."

def test_script():
    assert announce.announce_script("Evian\n water", 0.2) == "Logged Evian water. 0 milligrams of caffeine."
    assert announce.announce_script("Espresso", 1) == "Logged Espresso. 1 milligram of caffeine."

def test_errors_are_reported_and_not_cached(client, speech):
    fake, settings = speech
    settings["ELEVENLABS_API_KEY"] = ""
    assert client.post("/machine/announce", json=COKE).status_code == 503
    settings["ELEVENLABS_API_KEY"] = "fake-key"
    fake.status = 500
    assert client.post("/machine/announce", json=COKE).status_code == 502
    fake.status = 200
    assert client.post("/machine/announce", json=COKE).status_code == 200

@pytest.mark.parametrize("body", [{"drink": "", "mg": 1}, {"drink": "x" * 121, "mg": 1}, {"drink": "Cola", "mg": -1}])
def test_invalid(client, body):
    assert client.post("/machine/announce", json=body).status_code == 422

def test_needs_sign_in():
    with TestClient(app) as anonymous:
        assert anonymous.post("/machine/announce", json=COKE).status_code == 401

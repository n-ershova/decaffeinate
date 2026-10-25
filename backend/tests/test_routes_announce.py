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
    monkeypatch.setattr(announce, "gemini_quip", lambda facts: None)   # no live Gemini in tests
    return fake, settings

COKE = {"drink": "Coca-Cola 330 ml can", "mg": 32}

def test_speaks_the_drink_and_caffeine_and_caches_it(client, speech, monkeypatch):
    fake, _ = speech
    monkeypatch.setattr(announce.random, "choice", lambda options: options[0])   # same quip both times
    for _ in range(2):
        response = client.post("/machine/announce", json=COKE)
        assert response.status_code == 200 and response.content == b"ID3test-mp3"
        assert response.headers["content-type"].startswith("audio/mpeg")
    assert len(fake.posts) == 1
    url, kwargs = fake.posts[0]
    assert url.startswith("https://api.elevenlabs.io/v1/text-to-speech/")
    assert kwargs["headers"]["xi-api-key"] == "fake-key"
    assert kwargs["json"]["text"] == "First one of the day. Go get them, You."   # just the tease

def test_gemini_writes_the_remark_from_the_day(client, speech, monkeypatch):
    fake, _ = speech
    seen = []
    monkeypatch.setattr(announce, "gemini_quip", lambda facts: seen.append(facts) or "Bold move, donut.")
    assert client.post("/machine/announce", json=COKE).status_code == 200
    assert fake.posts[-1][1]["json"]["text"] == "Bold move, donut."
    assert "Coca-Cola 330 ml can, 32 mg caffeine" in seen[0] and "of 400 mg" in seen[0]

def test_preset_remark_when_gemini_is_unavailable(client, speech, monkeypatch):
    fake, _ = speech
    monkeypatch.setattr(announce.random, "choice", lambda options: options[0])
    client.post("/machine/announce", json=COKE)
    remark = fake.posts[-1][1]["json"]["text"]
    assert any(remark.startswith(q.split("{")[0]) for qs in announce.QUIPS.values() for q in qs)

def test_quip_facts():
    from datetime import datetime, time
    from zoneinfo import ZoneInfo
    from app.types import User
    user = User(id=1, name="Arryl Tham", bedtime=time(22, 30), smoker=False, hormonal_bc=False)
    now = datetime(2026, 10, 25, 20, tzinfo=ZoneInfo("Europe/London"))
    facts = announce.quip_facts(user, _day(now, 150, 80), "Red Bull", 80, now)
    assert facts == ("Name: Arryl. Drink just logged: Red Bull, 80 mg caffeine. Time now: 8:00 pm, "
                     "2.5 hours until their bedtime at 10:30 pm. Caffeine today including this one: "
                     "230 mg of 400 mg, from 2 caffeinated drink(s).")

class First:
    """rng stand-in: always the first quip, so the text is predictable."""
    @staticmethod
    def choice(options): return options[0]

def _day(now, *mgs):
    from app.types import Drink
    return [Drink(time=now, user_id=1, drink_key="cola", mg=m, mg_low=m, mg_high=m, source="jetson") for m in mgs]

@pytest.mark.parametrize("hour,mgs,mg,expect", [
    (9, [0], 0, "Zero caffeine. Who are you and what have you done with Arryl?"),
    (9, [300, 150], 150, "That's 450 milligrams today, Arryl. Your heart has filed a complaint."),
    (23, [80], 80, "It's past your bedtime and you're having caffeine? You absolute donut."),
    (20, [80], 80, "Caffeine now, with bedtime at 10:30 pm? Enjoy staring at the ceiling, you donut."),
    (9, [80], 80, "First one of the day. Go get them, Arryl."),
    (11, [150, 120], 120, "That's 270 milligrams today. Easy, tiger."),
    (11, [80, 32], 32, "Another one? Bold."),
])
def test_quip_reads_the_day(hour, mgs, mg, expect):
    from datetime import datetime, time
    from zoneinfo import ZoneInfo
    from app.types import User
    user = User(id=1, name="Arryl Tham", bedtime=time(22, 30), smoker=False, hormonal_bc=False)
    now = datetime(2026, 10, 25, hour, tzinfo=ZoneInfo("Europe/London"))
    assert announce.quip(user, _day(now, *mgs), mg, now, rng=First) == expect

def test_bedtime_after_midnight_is_tonight():
    from datetime import datetime, time
    from zoneinfo import ZoneInfo
    from app.types import User
    user = User(id=1, name="Arryl", bedtime=time(0, 30), smoker=False, hormonal_bc=False)
    now = datetime(2026, 10, 25, 21, tzinfo=ZoneInfo("Europe/London"))   # 3.5 h before 00:30
    assert "bedtime at 12:30 am" in announce.quip(user, _day(now, 80), 80, now, rng=First)

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

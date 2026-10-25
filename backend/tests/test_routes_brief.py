from copy import deepcopy
import httpx
import pytest
from app.routes import brief
from conftest import STATE

@pytest.fixture
def speech(monkeypatch,tmp_path):
    settings={"ELEVENLABS_API_KEY":"fake-key","BRIEF_CACHE_DIR":str(tmp_path)}
    monkeypatch.setattr(brief,"setting",lambda name,default="":settings.get(name,default))
    class Speech:
        state=deepcopy(STATE)
        posts=[]
        status=200
        async def __aenter__(self): return self
        async def __aexit__(self,*args): pass
        async def get(self,url,params,**kwargs):
            assert url == "http://127.0.0.1:8000/state"
            code=404 if params["user_id"]==999 else 200
            return httpx.Response(code,json=self.state,request=httpx.Request("GET",url))
        async def post(self,url,**kwargs):
            self.posts.append((url,kwargs))
            return httpx.Response(self.status,content=b"ID3test-mp3",headers={"content-type":"audio/mpeg"},
                                  request=httpx.Request("POST",url))
    fake=Speech()
    monkeypatch.setattr(brief.httpx,"AsyncClient",lambda **kwargs:fake)
    return fake,settings

def test_audio_cached_by_day_and_advice(client,speech):
    fake,_=speech
    for _ in range(2):
        response=client.get("/brief")
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("audio/mpeg")
        assert response.content == b"ID3test-mp3"
    assert len(fake.posts) == 1
    url,kwargs=fake.posts[0]
    assert url.startswith("https://api.elevenlabs.io/v1/text-to-speech/")
    assert kwargs["headers"]["xi-api-key"] == "fake-key"
    assert "14:10" in kwargs["json"]["text"]
    fake.state["cutoff"]=None
    assert client.get("/brief").status_code == 200
    assert "No more caffeine today" in fake.posts[-1][1]["json"]["text"]
    assert len(fake.posts) == 2

def test_cache_separates_users_and_days(client,speech,now):
    from app.main import app
    from app.deps import get_now
    from datetime import timedelta
    fake,_=speech
    client.get("/brief")
    client.get("/brief?user_id=2")
    app.dependency_overrides[get_now]=lambda:now+timedelta(days=1)
    client.get("/brief")
    assert len(fake.posts) == 3

def test_errors_are_not_cached(client,speech):
    fake,settings=speech
    assert client.get("/brief?user_id=999").status_code == 404
    settings["ELEVENLABS_API_KEY"]=""
    assert client.get("/brief").status_code == 503
    settings["ELEVENLABS_API_KEY"]="fake-key"
    fake.status=401
    assert client.get("/brief").status_code == 502
    fake.status=200
    assert client.get("/brief").status_code == 200
    assert len(fake.posts) == 2

def test_http_timeout(client,speech,monkeypatch):
    fake,_=speech
    async def fail(*args,**kwargs):
        raise httpx.ReadTimeout("secret must not reach response")
    monkeypatch.setattr(fake,"get",fail)
    response=client.get("/brief")
    assert response.status_code == 504
    assert "secret" not in response.text

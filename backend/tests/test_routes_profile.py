import pytest
from conftest import PROFILE

def test_profile_downsampling(client, api_engine):
    result=client.get("/profile").json()
    assert set(result) == set(PROFILE)
    assert len(result["posterior"]["h_grid"]) == len(result["posterior"]["prob"]) == 60
    assert sum(result["posterior"]["prob"]) == pytest.approx(1)
    assert result["history"] == PROFILE["history"]
    assert len(api_engine.profile(1,None)["posterior"]["h_grid"]) == 200

def test_short_and_zero_probability_profiles(client, api_engine, monkeypatch):
    import copy
    profile=copy.deepcopy(PROFILE)
    profile["posterior"]={"h_grid":[2,5,8],"prob":[0,.5,.5]}
    monkeypatch.setattr(api_engine,"profile",lambda *args: profile)
    assert client.get("/profile").json()["posterior"] == profile["posterior"]
    profile["posterior"]={"h_grid":list(range(200)),"prob":[0]*199+[1]}
    result=client.get("/profile").json()["posterior"]
    assert sum(result["prob"]) == 1
    assert client.get("/profile?user_id=0").status_code == 422

def test_missing_user(client):
    assert client.get("/profile?user_id=999").status_code == 404

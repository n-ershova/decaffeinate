from conftest import STATE
import pytest

def test_state_contract(client):
    assert client.get("/state").json() == STATE
    assert client.get("/state?user_id=999").status_code == 404
    assert client.get("/state?user_id=0").status_code == 422

def test_whatif_contract(client):
    response = client.post("/whatif", json={"drink_key":"milk_coffee","mg":130})
    assert response.status_code == 200
    assert response.json() == {"extra_latency_min":{"median":9,"low":4,"high":17},
                               "curve":STATE["curve"],"led_after":"red","cap_exceeded":False}
    assert client.post("/whatif", json={"user_id":999,"drink_key":"milk_coffee","mg":130}).status_code == 404

@pytest.mark.parametrize("body", [{"mg":-1,"drink_key":"cola"},{"mg":80,"drink_key":"invented"},{"mg":80}, {"mg":80,"drink_key":"cola","extra":1}])
def test_whatif_validation(client, body):
    assert client.post("/whatif",json=body).status_code == 422

def test_startup_and_missing_models(client):
    from app.deps import get_engine
    from app.main import app
    assert client.get("/health").json() == {"status":"ok"}
    app.dependency_overrides.pop(get_engine)
    assert client.get("/state").status_code == 503

def test_curve_contract(client):
    assert client.get("/curve").json() == {"now_mg":142, "h":5, "curve":STATE["curve"]}
    assert client.get("/curve?user_id=999").status_code == 404
    assert client.get("/curve?user_id=0").status_code == 422

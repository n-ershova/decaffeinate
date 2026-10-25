from io import BytesIO
from PIL import Image
import pytest
from app.routes import identify
from app.types import GeminiResult

def test_text_auto_accept(client,api_repo,now,monkeypatch):
    monkeypatch.setattr(identify,"identify_text",lambda text: GeminiResult(drink="red_bull",confidence=.95))
    response=client.post("/drinks/identify",data={"text":"Red Bull","source":"text"})
    assert response.status_code == 200
    result=response.json()
    assert set(result) == {"gemini","estimate","logged"}
    assert result["logged"]["mg"] == 80 and result["logged"]["source"] == "text"
    assert len(client.get("/drinks").json()) == 1

def test_image_resized_and_unknown_not_logged(client,monkeypatch):
    raw=BytesIO()
    Image.new("RGB",(1600,1000)).save(raw,format="PNG")
    def recognize(image):
        with Image.open(BytesIO(image)) as photo:
            assert max(photo.size) == 768 and photo.format == "JPEG"
        return GeminiResult(drink="unknown",confidence=0)
    monkeypatch.setattr(identify,"identify_image",recognize)
    result=client.post("/drinks/identify",files={"image":("test.png",raw.getvalue(),"image/png")},data={"source":"jetson"})
    assert result.status_code == 200
    assert result.json()["logged"] is None
    assert client.get("/drinks").json() == []

def test_cafe_needs_confirmation(client,monkeypatch):
    monkeypatch.setattr(identify,"identify_text",lambda text: GeminiResult(drink="milk_coffee",size="regular",confidence=1))
    result=client.post("/drinks/identify",data={"text":"flat white"}).json()
    assert result["estimate"]["mg"] == 130 and result["logged"] is None

def test_invalid_identification_requests(client):
    assert client.post("/drinks/identify").status_code == 422
    assert client.post("/drinks/identify",data={"text":" "}).status_code == 422
    assert client.post("/drinks/identify",data={"text":"tea"},files={"image":("x.jpg",b"x","image/jpeg")}).status_code == 422
    assert client.post("/drinks/identify",files={"image":("x.jpg",b"x","image/jpeg")}).status_code == 422
    assert client.post("/drinks/identify",data={"text":"tea","user_id":999}).status_code == 404

def _jetson_scan(client):
    return client.post("/drinks/identify", files={"image": ("can.jpg", _jpeg(), "image/jpeg")},
                       data={"source": "jetson"}).json()

def _jpeg():
    raw = BytesIO()
    Image.new("RGB", (64, 64)).save(raw, format="JPEG")
    return raw.getvalue()

def test_machine_does_not_count_a_returning_drink_twice(client, api_repo, now, monkeypatch):
    from datetime import timedelta
    from app.deps import get_now
    from app.main import app
    monkeypatch.setattr(identify, "identify_image", lambda image: GeminiResult(drink="red_bull", confidence=.95))
    first = _jetson_scan(client)
    assert first["logged"]["source"] == "jetson" and "repeat" not in first
    # The same can comes back into view five minutes later: not logged again.
    app.dependency_overrides[get_now] = lambda: now + timedelta(minutes=5)
    again = _jetson_scan(client)
    assert again["logged"] is None and again["repeat"]["time"] == first["logged"]["time"]
    # After the window it's a new drink.
    app.dependency_overrides[get_now] = lambda: now + timedelta(minutes=11)
    assert _jetson_scan(client)["logged"] is not None
    assert len(client.get("/drinks").json()) == 2

def test_repeat_check_is_per_drink_and_machine_only(client, monkeypatch):
    drinks = iter(["red_bull", "cola"])
    monkeypatch.setattr(identify, "identify_image", lambda image: GeminiResult(drink=next(drinks), confidence=.95))
    _jetson_scan(client)
    assert _jetson_scan(client)["logged"]["drink_key"] == "cola"     # a different drink still logs
    # Typing it on the website is deliberate, so it always logs.
    monkeypatch.setattr(identify, "identify_text", lambda text: GeminiResult(drink="red_bull", confidence=.95))
    assert client.post("/drinks/identify", data={"text": "Red Bull", "source": "text"}).json()["logged"]

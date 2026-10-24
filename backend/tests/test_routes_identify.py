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

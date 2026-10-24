from pathlib import Path
import pytest
from fastapi import HTTPException
from app.routes import hr

def test_save_hr(client,api_repo,now):
    response=client.post("/hr",json={"hr_bpm":72,"br_bpm":14,"drink_time":now.isoformat()})
    assert response.status_code == 200
    assert response.json()["time"] == now.isoformat()
    assert api_repo._hr[0].hr_bpm == 72
    assert len(api_repo._drinks) == 0

@pytest.mark.parametrize("body",[{"hr_bpm":0,"br_bpm":12},{"hr_bpm":70,"br_bpm":-1},
                                  {"hr_bpm":70,"br_bpm":12,"drink_time":"2026-10-24T12:00:00"}])
def test_invalid_readings(client,body):
    assert client.post("/hr",json=body).status_code == 422

def test_unknown_user(client):
    assert client.post("/hr",json={"user_id":999,"hr_bpm":72,"br_bpm":14}).status_code == 404

def test_scan_stores_and_deletes_video(client,api_repo,monkeypatch):
    paths=[]
    def scan(path):
        assert path.exists() and path.read_bytes() == b"camera clip"
        paths.append(path)
        return {"hr_bpm":73,"br_bpm":15}
    monkeypatch.setattr(hr,"scan_video",scan)
    response=client.post("/hr/scan",files={"video":("scan.webm",b"camera clip","video/webm")})
    assert response.status_code == 200 and response.json()["hr_bpm"] == 73
    assert len(api_repo._hr) == 1
    assert not paths[0].exists()

def test_failed_scan_cleans_up_and_saves_nothing(client,api_repo,monkeypatch):
    paths=[]
    def scan(path):
        paths.append(path)
        raise HTTPException(502,"No reliable reading")
    monkeypatch.setattr(hr,"scan_video",scan)
    assert client.post("/hr/scan",files={"video":("scan.mp4",b"clip","video/mp4")}).status_code == 502
    assert not paths[0].exists() and api_repo._hr == []

def test_scan_validation(client,monkeypatch):
    assert client.post("/hr/scan",files={"video":("scan.txt",b"bad","text/plain")}).status_code == 422
    assert client.post("/hr/scan",files={"video":("scan.webm",b"","video/webm")}).status_code == 422
    monkeypatch.setattr(hr,"setting",lambda name,default="":default)
    assert client.post("/hr/scan",files={"video":("scan.webm",b"x","video/webm")}).status_code == 503

@pytest.mark.parametrize("data,status,phrase", [
    ({"error":"sdk","sdk_code":2},503,"API key"),
    ({"error":"sdk","sdk_code":4},503,"credits"),
    ({"error":"sdk","sdk_code":7},422,"video format"),
    ({"error":"video_decode"},422,"decoded"),
    ({"error":"timeout"},504,"too long"),
    ({"error":"no_rates","validation_code":5},422,"too dark"),
    ({"error":"no_breathing","validation_code":7},422,"upper chest"),
    ({"error":"no_rates","validation_code":11},422,"frame rate"),
])
def test_scan_reports_specific_causes(data,status,phrase):
    result_status,message=hr.scan_error(data)
    assert result_status == status and phrase in message

def test_subprocess_failure_diagnostics_are_safe(monkeypatch,tmp_path):
    import json
    from types import SimpleNamespace
    monkeypatch.setattr(hr,"ROOT",tmp_path)
    monkeypatch.setattr(hr,"setting",lambda name,default="": {"PRESAGE_API_KEY":"secret-key","PRESAGE_NODE":"node"}.get(name,default))
    output={"ok":False,"error":"sdk","sdk_code":7,"ran":False}
    monkeypatch.setattr(hr.subprocess,"run",lambda *args,**kwargs: SimpleNamespace(
        returncode=1,stdout=json.dumps(output),stderr="secret-key private video path"))
    with pytest.raises(HTTPException) as error:
        hr.scan_video(tmp_path/"scan.webm")
    assert error.value.status_code == 422
    assert "secret-key" not in error.value.detail
    log=(tmp_path/"work/presage-last-scan.json").read_text()
    assert "secret-key" not in log and "private video" not in log
    assert json.loads(log)["sdk_code"] == 7

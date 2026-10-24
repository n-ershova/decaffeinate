"""Stores readings and processes a temporary browser video through Presage."""
from datetime import datetime
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from threading import Lock
from time import perf_counter
from typing import Annotated
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field
from app.db.repo import Repo
from app.deps import ROOT, get_now, get_repo, require_user, setting
from app.types import HrCheck

router = APIRouter()
SCAN_LOCK = Lock()
MAX_VIDEO_BYTES = 30 * 1024 * 1024

def scan_error(data: dict) -> tuple[int, str]:
    error, code = data.get("error"), data.get("sdk_code")
    if code == 2:
        return 503, "Presage rejected the API key. Check the Presage key in .env."
    if code == 4:
        return 503, "Your Presage account has no measurement credits available."
    if error in {"configuration", "runtime"} or code == 3:
        return 503, "The Presage runtime is not configured correctly on this server."
    if error == "video_decode":
        return 422, "The recording could not be decoded. Please record a new scan in Chrome or Edge."
    if error == "timeout":
        return 504, "Processing this recording took too long. Please try again."
    if code in {5, 6}:
        return 502, "The Presage service could not be reached. Please try again shortly."
    if code in {7, 9}:
        return 422, "Presage could not read this video format. Try recording again in Chrome or Edge."
    messages = {
        1: "No face was detected reliably. Keep one face and your upper chest in view.",
        2: "More than one face was detected. Only one person should be in view.",
        3: "Keep your face centered and facing the camera throughout the scan.",
        4: "Move slightly closer or farther away so your face fits comfortably in view.",
        5: "Your face was too dark in the recording. Add even light in front of you.",
        6: "The recording was too bright. Reduce direct light on your face.",
        7: "Your upper chest was not visible enough to measure breathing. Move back slightly.",
        11: "The camera frame rate was too low. Use a well-lit room and close other camera apps.",
        12: "Too much movement was detected. Keep the camera still and avoid talking.",
        13: "Move slightly farther from the camera so your face and upper chest are visible.",
        14: "Move slightly closer to the camera while keeping your upper chest visible."
    }
    if data.get("validation_code") in messages:
        return 422, messages[data["validation_code"]]
    if error == "no_breathing":
        return 422, "A pulse was detected, but breathing did not become reliable. Keep your upper chest visible and stay still for the full scan."
    if error == "no_pulse":
        return 422, "Breathing was detected, but the pulse did not become reliable. Keep your face evenly lit and still."
    return 422, "The recording did not contain enough reliable pulse and breathing data. Keep your face and upper chest visible for the full scan."

class HrRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)
    user_id: int = Field(default=1, ge=1)
    drink_time: AwareDatetime | None = None
    hr_bpm: float = Field(gt=0, le=300)
    br_bpm: float = Field(gt=0, le=100)

@router.post("/hr", response_model=HrCheck)
def save_hr(body: HrRequest, repo: Repo = Depends(get_repo), now: datetime = Depends(get_now)):
    require_user(repo, body.user_id)
    return repo.add_hr(HrCheck(time=now, **body.model_dump()))

def scan_video(path: Path) -> dict:
    key = setting("PRESAGE_API_KEY")
    if not key:
        raise HTTPException(503, "Configure PRESAGE_API_KEY to enable camera scans")
    node = setting("PRESAGE_NODE") or shutil.which("node")
    if not node:
        raise HTTPException(503, "Install Node.js 20 or later for Presage scans")
    try:
        import imageio_ffmpeg
        ffmpeg = setting("PRESAGE_FFMPEG") or imageio_ffmpeg.get_ffmpeg_exe()
    except (ImportError, RuntimeError):
        raise HTTPException(503, "Install the backend requirements to enable video decoding") from None
    if not SCAN_LOCK.acquire(blocking=False):
        raise HTTPException(409, "A scan is already being processed; retry shortly")
    try:
        started = perf_counter()
        result = subprocess.run(
            [node, str(ROOT / "presage/scan.mjs"), str(path)],
            capture_output=True, text=True, encoding="utf-8", timeout=90,
            env={**os.environ, "PRESAGE_API_KEY": key, "PRESAGE_FFMPEG": ffmpeg})
        try:
            data = json.loads(result.stdout.strip().splitlines()[-1])
            if not isinstance(data, dict):
                raise ValueError("Invalid scan response")
            if result.returncode or data.get("ok") is False:
                # Keep safe status diagnostics only, never video or raw stderr.
                diagnostic = {k: data[k] for k in ("error", "sdk_code", "validation_code",
                    "validation_counts", "pulse_samples", "breathing_samples", "ran") if k in data}
                diagnostic["elapsed_seconds"] = round(perf_counter() - started, 2)
                try:
                    (ROOT / "work").mkdir(exist_ok=True)
                    (ROOT / "work/presage-last-scan.json").write_text(json.dumps(diagnostic), encoding="utf-8")
                except OSError:
                    pass
                status, message = scan_error(data)
                raise HTTPException(status, message)
            return {"hr_bpm": float(data["hr_bpm"]), "br_bpm": float(data["br_bpm"])}
        except (ValueError, KeyError, IndexError, TypeError):
            raise HTTPException(502, "Presage could not process the recording. Check that its Node SDK is installed.") from None
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "Presage processing timed out") from None
    except OSError:
        raise HTTPException(503, "Presage runtime is unavailable") from None
    finally:
        SCAN_LOCK.release()

@router.post("/hr/scan", response_model=HrCheck)
def scan(video: Annotated[UploadFile, File()],
         user_id: Annotated[int, Form(ge=1)] = 1,
         drink_time: Annotated[AwareDatetime | None, Form()] = None,
         repo: Repo = Depends(get_repo), now: datetime = Depends(get_now)):
    require_user(repo, user_id)
    if video.content_type not in {"video/webm", "video/mp4", "video/quicktime"}:
        raise HTTPException(422, "Upload a WebM or MP4 camera recording")
    suffix = ".webm" if video.content_type == "video/webm" else ".mp4"
    directory = ROOT / "work/hr-scans"
    directory.mkdir(parents=True, exist_ok=True)
    # Delete the face video on success and on every failure path.
    with tempfile.TemporaryDirectory(dir=directory) as temporary:
        path = Path(temporary) / f"scan{suffix}"
        size = 0
        with path.open("wb") as output:
            while chunk := video.file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_VIDEO_BYTES:
                    raise HTTPException(413, "Recording exceeds 30 MB")
                output.write(chunk)
        if not size:
            raise HTTPException(422, "Recording is empty")
        values = scan_video(path)
        try:
            body = HrRequest(user_id=user_id, drink_time=drink_time, **values)
        except ValueError:
            raise HTTPException(502, "Presage returned an invalid reading") from None
        return repo.add_hr(HrCheck(time=now, **body.model_dump()))

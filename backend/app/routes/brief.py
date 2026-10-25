"""Daily ElevenLabs audio, based on /state over HTTP rather than engine imports."""
import asyncio
from datetime import datetime
import hashlib
from pathlib import Path
from typing import Annotated
import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from app.deps import ROOT, get_now, setting
from app.auth import authorize_user, COOKIE

router = APIRouter()

def brief_script(state: dict) -> str:
    cutoff = state.get("cutoff")
    advice = f"Your last coffee today is at {cutoff}." if cutoff else "No more caffeine today."
    return (f"Morning. {advice} Your bedtime is {state['bedtime']}. "
            f"You have logged {state['daily_total_mg']:g} milligrams of caffeine today, "
            f"against your daily cap of {state['cap_mg']:g} milligrams.")

@router.get("/brief")
async def brief(request: Request, user_id: Annotated[int, Query(ge=1)] = 1,
                now: datetime = Depends(get_now)):
    authorize_user(user_id)
    base = setting("HALFLIFE_API", "http://127.0.0.1:8000").rstrip("/")
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            state_response = await client.get(f"{base}/state", params={"user_id": user_id},
                                              cookies={COOKIE: request.cookies.get(COOKIE, "")})
            if state_response.status_code == 404:
                raise HTTPException(404, "Unknown user")
            if state_response.status_code == 503:
                raise HTTPException(503, "Daily advice is not available yet")
            state_response.raise_for_status()
            script = brief_script(state_response.json())
    except httpx.TimeoutException:
        raise HTTPException(504, "Daily advice timed out") from None
    except (httpx.HTTPError, KeyError, TypeError, ValueError):
        raise HTTPException(502, "Could not load daily advice") from None

    voice = setting("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
    model = setting("ELEVENLABS_MODEL", "eleven_multilingual_v2")
    digest = hashlib.sha256(f"{user_id}|{now.date()}|{voice}|{model}|{script}".encode()).hexdigest()
    directory = Path(setting("BRIEF_CACHE_DIR", str(ROOT / "work/brief_cache")))
    cache = directory / f"{digest}.mp3"
    if not hasattr(request.app.state, "brief_locks"):
        request.app.state.brief_locks = {}
    locks = request.app.state.brief_locks
    lock = locks.setdefault(digest, asyncio.Lock())
    try:
        async with lock:
            if cache.exists():
                return Response(cache.read_bytes(), media_type="audio/mpeg")
            key = setting("ELEVENLABS_API_KEY")
            if not key:
                raise HTTPException(503, "Configure ELEVENLABS_API_KEY to enable spoken briefs")
            try:
                async with httpx.AsyncClient(timeout=30) as client:
                    audio = await client.post(
                        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}",
                        params={"output_format": "mp3_44100_128"},
                        headers={"xi-api-key": key, "Accept": "audio/mpeg"},
                        json={"text": script, "model_id": model})
                    audio.raise_for_status()
                if not audio.content or not audio.headers.get("content-type", "").startswith("audio/"):
                    raise HTTPException(502, "Speech service returned no audio")
            except httpx.TimeoutException:
                raise HTTPException(504, "Speech service timed out") from None
            except httpx.HTTPError:
                raise HTTPException(502, "Speech service is unavailable") from None
            try:
                directory.mkdir(parents=True, exist_ok=True)
                temporary = cache.with_suffix(".tmp")
                temporary.write_bytes(audio.content)
                temporary.replace(cache)
            except OSError:
                pass  # Speech remains usable when cache storage is unavailable.
            return Response(audio.content, media_type="audio/mpeg")
    finally:
        if not lock.locked():
            locks.pop(digest, None)

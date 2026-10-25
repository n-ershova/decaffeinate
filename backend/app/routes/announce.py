"""Spoken confirmation for the desk machine: ElevenLabs reads out a drink it just logged.

The Jetson posts the drink and caffeine it got back from /drinks/identify and plays the
audio on its speaker. The sentence is built here, not sent in as text, so the endpoint
can't be used to voice anything else, and the API key never leaves the server.
"""
import hashlib
from pathlib import Path
import httpx
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel, Field
from app.auth import authorize_user
from app.deps import ROOT, setting

router = APIRouter()

class Announcement(BaseModel):
    user_id: int = Field(1, ge=1)
    drink: str = Field(min_length=1, max_length=120)   # Gemini's verdict, e.g. "Coca-Cola 330 ml can"
    mg: float = Field(ge=0, le=1000)

def announce_script(drink: str, mg: float) -> str:
    amount = round(mg)
    unit = "milligram" if amount == 1 else "milligrams"
    return f"Logged {' '.join(drink.split())}. {amount} {unit} of caffeine."

@router.post("/machine/announce")
async def announce(body: Announcement):
    authorize_user(body.user_id)
    script = announce_script(body.drink, body.mg)
    voice = setting("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
    model = setting("ELEVENLABS_MODEL", "eleven_multilingual_v2")
    # The same drink is announced again and again, so cache by what is said.
    digest = hashlib.sha256(f"{voice}|{model}|{script}".encode()).hexdigest()
    cache = Path(setting("ANNOUNCE_CACHE_DIR", str(ROOT / "work/announce_cache"))) / f"{digest}.mp3"
    try:
        return Response(cache.read_bytes(), media_type="audio/mpeg")
    except OSError:
        pass
    key = setting("ELEVENLABS_API_KEY")
    if not key:
        raise HTTPException(503, "Configure ELEVENLABS_API_KEY to enable spoken announcements")
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            audio = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice}",
                params={"output_format": "mp3_44100_128"},
                headers={"xi-api-key": key, "Accept": "audio/mpeg"},
                json={"text": script, "model_id": model})
            audio.raise_for_status()
    except httpx.TimeoutException:
        raise HTTPException(504, "Speech service timed out") from None
    except httpx.HTTPError:
        raise HTTPException(502, "Speech service is unavailable") from None
    if not audio.content or not audio.headers.get("content-type", "").startswith("audio/"):
        raise HTTPException(502, "Speech service returned no audio")
    try:
        cache.parent.mkdir(parents=True, exist_ok=True)
        temporary = cache.with_suffix(".tmp")
        temporary.write_bytes(audio.content)
        temporary.replace(cache)
    except OSError:
        pass  # Speech remains usable when cache storage is unavailable.
    return Response(audio.content, media_type="audio/mpeg")

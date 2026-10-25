"""Spoken confirmation for the desk machine: when a drink is logged, ElevenLabs says a
cheeky remark about it that Gemini writes fresh each time from the person's day (the
drink, how late it is, how much they've had). If Gemini is slow or down, a preset remark
is used instead.

The Jetson posts the drink and caffeine it got back from /drinks/identify and plays the
audio on its speaker. The sentence is built here, not sent in as text, so the endpoint
can't be used to voice anything else, and the API key never leaves the server.
"""
import asyncio
from datetime import datetime, timedelta
import hashlib
import logging
from pathlib import Path
import random
import httpx
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from app.db.repo import Repo
from app.deps import ROOT, get_now, get_repo, require_user, setting
from app.types import Drink, User

log = logging.getLogger(__name__)
router = APIRouter()

class Announcement(BaseModel):
    user_id: int = Field(1, ge=1)
    drink: str = Field(min_length=1, max_length=120)   # Gemini's verdict, e.g. "Coca-Cola 330 ml can"
    mg: float = Field(ge=0, le=1000)

CAP_MG = 400   # the usual healthy-adult daily limit, as in the model's LED rule

# Most urgent situation first; {name}, {bed} and {total} are filled in.
QUIPS = {
    "decaf": ["Zero caffeine. Who are you and what have you done with {name}?",
              "No caffeine at all. Look at you, making good choices for once."],
    "over_cap": ["That's {total} milligrams today, {name}. Your heart has filed a complaint.",
                 "{total} milligrams. You're not a person any more, you're a coffee machine with legs."],
    "past_bedtime": ["It's past your bedtime and you're having caffeine? You absolute donut.",
                     "Bedtime was {bed}, {name}. This is how villains are made."],
    "late": ["Caffeine now, with bedtime at {bed}? Enjoy staring at the ceiling, you donut.",
             "Bold choice, {name}. Bedtime's at {bed}. Your pillow is disappointed in you."],
    "first": ["First one of the day. Go get them, {name}.", "And so it begins."],
    "stacking": ["That's {total} milligrams today. Easy, tiger.",
                 "{total} milligrams and counting. Pace yourself, you donut."],
    "default": ["Another one? Bold.", "Noted. Quietly judging you."],
}

def _clock(t) -> str:
    return t.strftime("%I:%M %p").lstrip("0").lower()

def _hours_to_bed(user: User, now: datetime) -> float:
    bed = now.replace(hour=user.bedtime.hour, minute=user.bedtime.minute, second=0, microsecond=0)
    if bed < now - timedelta(hours=8):
        bed += timedelta(days=1)          # bedtime is tonight, not this morning
    return (bed - now).total_seconds() / 3600

def quip(user: User, today: list[Drink], mg: float, now: datetime, rng=random) -> str:
    """A preset cheeky line about this drink, from the person's day so far (today includes it)."""
    total = round(sum(d.mg for d in today))
    hours_left = _hours_to_bed(user, now)
    caffeinated = [d for d in today if d.mg > 0]
    if mg <= 0:
        mood = "decaf"
    elif total > CAP_MG:
        mood = "over_cap"
    elif hours_left <= 0:
        mood = "past_bedtime"
    elif hours_left < 6:                  # caffeine's half-life is about five hours
        mood = "late"
    elif len(caffeinated) <= 1:
        mood = "first"
    elif total >= 250:
        mood = "stacking"
    else:
        mood = "default"
    return rng.choice(QUIPS[mood]).format(name=user.name.split()[0], bed=_clock(user.bedtime), total=total)

QUIP_PROMPT = """You are the sarcastic voice of a desk gadget that logs caffeine. Someone just
logged a drink. Reply with ONE short cheeky remark (max 20 words) roasting them about it,
based on the facts given: the time of day, how close it is to their bedtime, how much
caffeine they've had today versus the 400 mg daily limit, how many drinks so far.
Mention the drink so they know it was logged. Playful British banter ("you donut"
energy), teasing, never cruel, no swearing, no
medical advice, no emojis, no hashtags. Use their first name at most once. It will be
read aloud, so plain words only. Reply with the remark only, no quotes."""

def quip_facts(user: User, today: list[Drink], drink: str, mg: float, now: datetime) -> str:
    hours_left = _hours_to_bed(user, now)
    bed = ("bedtime has already passed" if hours_left <= 0
           else f"{hours_left:.1f} hours until their bedtime at {_clock(user.bedtime)}")
    caffeinated = [d for d in today if d.mg > 0]
    return (f"Name: {user.name.split()[0]}. Drink just logged: {drink}, {round(mg)} mg caffeine. "
            f"Time now: {_clock(now)}, {bed}. Caffeine today including this one: "
            f"{round(sum(d.mg for d in today))} mg of 400 mg, from {len(caffeinated)} caffeinated drink(s).")

def gemini_quip(facts: str) -> str | None:
    """Gemini's remark for these facts, or None if it isn't available in a few seconds."""
    from google import genai
    from google.genai import types
    model = setting("GEMINI_MODEL", "gemini-3.5-flash-lite")
    timeout_s = 5
    try:
        thinking = (types.ThinkingConfig(thinking_budget=0) if model.startswith("gemini-2.")
                    else types.ThinkingConfig(thinking_level="MINIMAL" if "flash-lite" in model else "LOW"))
        with genai.Client(api_key=setting("GEMINI_API_KEY"), http_options=types.HttpOptions(
                timeout=timeout_s * 1000, headers={"X-Server-Timeout": "10"},
                retry_options=types.HttpRetryOptions(attempts=1))) as client:
            response = client.models.generate_content(
                model=model, contents=facts,
                config=types.GenerateContentConfig(system_instruction=QUIP_PROMPT, temperature=1.0,
                                                   thinking_config=thinking))
        line = " ".join((response.text or "").split()).strip('"\'')
        return line[:200] or None
    except Exception as error:
        # Never log exception bodies: they may contain the key.
        log.warning("Gemini quip unavailable (%s)", type(error).__name__)
        return None

@router.post("/machine/announce")
async def announce(body: Announcement, repo: Repo = Depends(get_repo), now: datetime = Depends(get_now)):
    user = require_user(repo, body.user_id)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    today = repo.list_drinks(body.user_id, start, now + timedelta(minutes=1))
    remark = await asyncio.to_thread(gemini_quip, quip_facts(user, today, body.drink, body.mg, now))
    script = remark or quip(user, today, body.mg, now)   # straight into the tease
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

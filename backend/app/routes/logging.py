from datetime import date, datetime, time, timedelta
import json
from typing import Annotated, Literal
from fastapi import APIRouter, Depends, Query
from pydantic import AwareDatetime, BaseModel, ConfigDict, Field, model_validator
from app.db.repo import Repo
from app.deps import ROOT, get_now, get_repo, require_user
from app.types import DRINK_KEYS, Alcohol, Drink, Preset, SleepNight, Source

router = APIRouter()

class DrinkRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)
    user_id: int = Field(default=1, ge=1)
    drink_key: Literal[tuple(DRINK_KEYS)]
    mg: float = Field(ge=0)
    mg_low: float = Field(ge=0)
    mg_high: float = Field(ge=0)
    source: Source
    time: AwareDatetime | None = None

    @model_validator(mode="after")
    def ordered_range(self):
        if not self.mg_low <= self.mg <= self.mg_high:
            raise ValueError("mg must lie between mg_low and mg_high")
        return self

class AlcoholRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)
    user_id: int = Field(default=1, ge=1)
    units: float = Field(ge=0)
    time: AwareDatetime | None = None

class SleepRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)
    user_id: int = Field(default=1, ge=1)
    night: date
    bedtime: AwareDatetime
    latency_min: float = Field(ge=0, le=1440)
    rested_1to5: int | None = Field(default=None, ge=1, le=5)

class DeleteDrinksRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    user_id: int = Field(default=1, ge=1)
    times: list[AwareDatetime] = Field(max_length=1000)

class DeleteSleepRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    user_id: int = Field(default=1, ge=1)
    nights: list[date] = Field(max_length=1000)

@router.post("/drinks", response_model=Drink)
def add_drink(body: DrinkRequest, repo: Repo = Depends(get_repo), now: datetime = Depends(get_now)):
    require_user(repo, body.user_id)
    return repo.add_drink(Drink(**{**body.model_dump(), "time": body.time or now}))

@router.get("/drinks", response_model=list[Drink])
def drinks(user_id: Annotated[int, Query(ge=1)] = 1, days: Annotated[int, Query(ge=1, le=365)] = 14,
           repo: Repo = Depends(get_repo), now: datetime = Depends(get_now)):
    require_user(repo, user_id)
    return repo.list_drinks(user_id, now - timedelta(days=days), now + timedelta(microseconds=1))

@router.delete("/drinks")
def delete_drinks(body: DeleteDrinksRequest, repo: Repo = Depends(get_repo)):
    require_user(repo, body.user_id)
    return {"deleted": repo.delete_drinks(body.user_id, body.times)}

@router.post("/alcohol", response_model=Alcohol)
def add_alcohol(body: AlcoholRequest, repo: Repo = Depends(get_repo), now: datetime = Depends(get_now)):
    require_user(repo, body.user_id)
    return repo.add_alcohol(Alcohol(**{**body.model_dump(), "time": body.time or now}))

@router.post("/sleep", response_model=SleepNight)
def sleep(body: SleepRequest, repo: Repo = Depends(get_repo)):
    require_user(repo, body.user_id)
    return repo.upsert_sleep(SleepNight(**body.model_dump()))

@router.delete("/sleep")
def delete_sleep(body: DeleteSleepRequest, repo: Repo = Depends(get_repo)):
    require_user(repo, body.user_id)
    return {"deleted": repo.delete_sleep(body.user_id, body.nights)}

@router.get("/sleep", response_model=list[SleepNight])
def sleep_nights(user_id: Annotated[int, Query(ge=1)] = 1, repo: Repo = Depends(get_repo)):
    require_user(repo, user_id)
    return sorted(repo.list_sleep(user_id), key=lambda s: s.night, reverse=True)

@router.get("/sleep/pending")
def pending(user_id: Annotated[int, Query(ge=1)] = 1,
            repo: Repo = Depends(get_repo), now: datetime = Depends(get_now)):
    require_user(repo, user_id)
    night = now.date() - timedelta(days=1)
    recorded = any(s.night == night for s in repo.list_sleep(user_id))
    return {"needs_checkin": now.timetz().replace(tzinfo=None) >= time(5) and not recorded,
            "night": night}

@router.get("/presets", response_model=list[Preset])
def presets():
    rows = json.loads((ROOT / "data/drinks.json").read_text(encoding="utf-8"))
    result = []
    for row in rows:
        if row["preset"]:
            shots = 2 if row["per"] == "shot" and row["key"] != "espresso_shot" else 1
            bonus = 10 if row["key"] == "mocha" else 0
            result.append(Preset(key=row["key"], label=row["label"],
                                 **{out: row[key] * shots + bonus for out, key in
                                    (("mg", "mg"), ("mg_low", "low"), ("mg_high", "high"))}))
    return result

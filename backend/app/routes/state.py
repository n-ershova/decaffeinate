from datetime import datetime
from typing import Annotated, Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field
from app.deps import get_engine, get_now
from app.drinks.lookup import presets
from app.services.engine import Engine
from app.types import DRINK_KEYS
from app.auth import authorize_user

router = APIRouter()

class WhatIfRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)
    user_id: int = Field(default=1, ge=1)
    drink_key: Literal[tuple(DRINK_KEYS)]
    mg: float = Field(ge=0)

@router.get("/state")
def state(user_id: Annotated[int, Query(ge=1)] = 1, drink_key: str | None = None,
          engine: Engine = Depends(get_engine), now: datetime = Depends(get_now)):
    """`drink_key` picks the drink the cutoff is for (a caffeinated preset); default is a 130 mg coffee."""
    authorize_user(user_id)
    kwargs = {}
    if drink_key is not None:
        preset = next((p for p in presets() if p.key == drink_key and p.mg > 0), None)
        if preset is None:
            raise HTTPException(422, "drink_key must be a caffeinated preset")
        kwargs = {"std_mg": preset.mg, "drink_label": preset.label}
    try:
        return engine.state(user_id, now, **kwargs)
    except KeyError:
        raise HTTPException(404, "Unknown user") from None

@router.get("/curve")
def curve(user_id: Annotated[int, Query(ge=1)] = 1,
          engine: Engine = Depends(get_engine), now: datetime = Depends(get_now)):
    authorize_user(user_id)
    try:
        return engine.curve(user_id, now)
    except KeyError:
        raise HTTPException(404, "Unknown user") from None

@router.post("/whatif")
def whatif(body: WhatIfRequest, engine: Engine = Depends(get_engine), now: datetime = Depends(get_now)):
    authorize_user(body.user_id)
    try:
        return engine.whatif(body.user_id, now, body.drink_key, body.mg)
    except KeyError:
        raise HTTPException(404, "Unknown user") from None

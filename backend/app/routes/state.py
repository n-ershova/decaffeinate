from datetime import datetime
from typing import Annotated, Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field
from app.deps import get_engine, get_now
from app.services.engine import Engine
from app.types import DRINK_KEYS

router = APIRouter()

class WhatIfRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)
    user_id: int = Field(default=1, ge=1)
    drink_key: Literal[tuple(DRINK_KEYS)]
    mg: float = Field(ge=0)

@router.get("/state")
def state(user_id: Annotated[int, Query(ge=1)] = 1,
          engine: Engine = Depends(get_engine), now: datetime = Depends(get_now)):
    try:
        return engine.state(user_id, now)
    except KeyError:
        raise HTTPException(404, "Unknown user") from None

@router.post("/whatif")
def whatif(body: WhatIfRequest, engine: Engine = Depends(get_engine), now: datetime = Depends(get_now)):
    try:
        return engine.whatif(body.user_id, now, body.drink_key, body.mg)
    except KeyError:
        raise HTTPException(404, "Unknown user") from None

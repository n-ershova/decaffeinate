from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
import numpy as np
from app.deps import get_engine, get_now
from app.services.engine import Engine

router = APIRouter()

@router.get("/profile")
def profile(user_id: Annotated[int, Query(ge=1)] = 1,
            engine: Engine = Depends(get_engine), now: datetime = Depends(get_now)):
    try:
        result = engine.profile(user_id, now)
    except KeyError:
        raise HTTPException(404, "Unknown user") from None
    posterior = result["posterior"]
    grid, prob = np.asarray(posterior["h_grid"]), np.asarray(posterior["prob"])
    if len(grid) > 60:
        # Sum adjacent bins rather than discarding posterior probability mass.
        bins = np.array_split(np.arange(len(grid)), 60)
        posterior = {"h_grid": [float(np.average(grid[b], weights=prob[b])) if prob[b].sum() > 0
                               else float(grid[b].mean()) for b in bins],
                     "prob": [float(prob[b].sum()) for b in bins]}
    return {**result, "posterior": posterior}

"""Desk machine activity log: the Jetson posts detections and results, the machine page reads them.

Unlike /machine, entries name the drinks someone holds up, so they are per account
and need sign-in. Kept in memory: it is a live view, not a record (drinks are logged
separately by /drinks/identify).
"""
from collections import deque
from datetime import datetime, timezone
from itertools import count
from threading import Lock
from typing import Annotated, Literal
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from app.db.repo import Repo
from app.deps import get_repo, require_user

router = APIRouter()
KEEP = 200            # newest entries kept per user
Kind = Literal["info", "track", "lost", "trigger", "logged", "unsure", "error"]

class Entry(BaseModel):
    user_id: int = Field(1, ge=1)
    kind: Kind
    message: str = Field(min_length=1, max_length=200)

_lock = Lock()
_seq = count(1)
_logs: dict[int, deque] = {}

@router.post("/machine/log")
def add(body: Entry, repo: Repo = Depends(get_repo)):
    require_user(repo, body.user_id)
    with _lock:
        entry = {"seq": next(_seq), "time": datetime.now(timezone.utc).isoformat(),
                 "kind": body.kind, "message": body.message}
        _logs.setdefault(body.user_id, deque(maxlen=KEEP)).append(entry)
    return {"seq": entry["seq"]}

@router.get("/machine/log")
def read(user_id: Annotated[int, Query(ge=1)] = 1, after: Annotated[int, Query(ge=0)] = 0,
         repo: Repo = Depends(get_repo)):
    """Entries newer than seq `after`, oldest first; poll with `last`.

    `last` is the newest stored seq, so a `last` below `after` means the log was
    reset (a restarted backend) and the reader should start again from 0.
    """
    require_user(repo, user_id)
    with _lock:
        log = _logs.get(user_id, ())
        entries = [e for e in log if e["seq"] > after]
        last = log[-1]["seq"] if log else 0
    return {"entries": entries, "last": last}

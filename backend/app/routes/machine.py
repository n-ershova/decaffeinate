"""Desk machine presence: the Jetson pings /machine/heartbeat each poll, the app reads /machine."""
from datetime import datetime, timezone
from threading import Lock
from time import time
from fastapi import APIRouter

router = APIRouter()
# The Jetson polls every 2 s, so a few missed beats means it's gone.
ONLINE_WITHIN_S = 10
_lock = Lock()
_last_seen: float | None = None   # wall-clock seconds; in memory, it only matters while running

@router.post("/machine/heartbeat")
def heartbeat():
    global _last_seen
    with _lock:
        _last_seen = time()
    return {"ok": True}

@router.get("/machine")
def machine():
    with _lock:
        seen = _last_seen
    if seen is None:
        return {"online": False, "last_seen": None, "seconds_ago": None}
    ago = max(0.0, time() - seen)
    return {"online": ago <= ONLINE_WITHIN_S,
            "last_seen": datetime.fromtimestamp(seen, timezone.utc).isoformat(),
            "seconds_ago": round(ago, 1)}

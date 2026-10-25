"""Shared, overridable API dependencies."""
from datetime import datetime, time
from functools import lru_cache
import os
from pathlib import Path
from zoneinfo import ZoneInfo
from dotenv import dotenv_values
from fastapi import Depends, HTTPException
from app.db.repo import Repo
from app.services.engine import Engine
from app.types import User

ROOT = Path(__file__).resolve().parents[2]

def setting(name: str, default: str = "") -> str:
    return os.environ.get(name) or dotenv_values(ROOT / ".env").get(name) or default

@lru_cache
def get_repo() -> Repo:
    mode = setting("REPO", "memory")
    if mode == "memory":
        from app.db.memory_repo import MemoryRepo
        return MemoryRepo()
    if mode == "tiger":
        from app.db.tiger_repo import TigerRepo
        repo = TigerRepo(setting("DATABASE_URL"))
        if repo.get_user(1) is None:
            try:
                repo.create_user(User(id=1, name="You", bedtime=time(23, 30), smoker=False, hormonal_bc=False))
            except ValueError:
                pass
        return repo
    raise ValueError("REPO must be memory or tiger")

def get_engine(repo: Repo = Depends(get_repo)) -> Engine:
    return Engine(repo)

def get_now() -> datetime:
    return datetime.now(ZoneInfo(setting("HALFLIFE_TIMEZONE", "Europe/London")))

def require_user(repo: Repo, user_id: int) -> User:
    from app.auth import authorize_user
    authorize_user(user_id)
    user = repo.get_user(user_id)
    if user is None:
        raise HTTPException(404, "Unknown user")
    return user

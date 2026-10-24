"""Idempotent two-person demo seeding and deterministic SQL export."""
from datetime import datetime, time, timedelta
from threading import Lock
from fastapi import APIRouter, Depends, HTTPException
from app.db.repo import Repo
from app.deps import get_now, get_repo
from app.types import SimHistory, User

router = APIRouter()
SEED_LOCK = Lock()

def simulate_user(user, true_h, true_beta, start, days, seed):
    from app.services.engine import simulate_history
    return simulate_history(user, true_h, true_beta, start, days, seed)

def histories(now: datetime) -> list[SimHistory]:
    start = now.date() - timedelta(days=21)
    return [simulate_user(
        User(id=id, name=name, bedtime=time(23, 30), smoker=False, hormonal_bc=False, is_simulated=True),
        true_h=h, true_beta=6, start=start, days=21, seed=42)
        for id, name, h in ((2, "Sam (fast, h=3)", 3), (3, "Alex (slow, h=8)", 8))]

@router.post("/demo/seed")
def seed(repo: Repo = Depends(get_repo), now: datetime = Depends(get_now)):
    # Generate everything before touching stored data. Missing M1/M8 returns 503.
    data = histories(now)
    with SEED_LOCK:
        for history in data:
            existing = repo.get_user(history.user.id)
            if existing is not None and not existing.is_simulated:
                raise HTTPException(409, "Demo IDs belong to a real user; existing data was preserved")
        for history in data:
            user = history.user
            if repo.get_user(user.id) is None:
                repo.create_user(user)
            else:
                repo.update_user(user.id, **user.model_dump(exclude={"id"}))
            repo.reset_user(user.id)
            for drink in history.drinks:
                repo.add_drink(drink)
            for alcohol in history.alcohol:
                repo.add_alcohol(alcohol)
            for night in history.nights:
                repo.upsert_sleep(night)
    return {"users": [{"id": h.user.id, "name": h.user.name, "true_h": h.true_h} for h in data]}

def seed_sql(data: list[SimHistory]) -> str:
    def literal(value):
        if value is None:
            return "NULL"
        if isinstance(value, bool):
            return "TRUE" if value else "FALSE"
        if isinstance(value, (int, float)):
            return str(value)
        if hasattr(value, "isoformat"):
            value = value.isoformat()
        return "'" + str(value).replace("'", "''") + "'"
    lines = ["-- Standalone synthetic demo, users 2/3 only. Apply db/schema.sql first.", "BEGIN;",
             "DO $$ BEGIN IF EXISTS (SELECT 1 FROM users WHERE id IN (2,3) AND NOT is_simulated) THEN RAISE EXCEPTION 'Demo IDs belong to a real user'; END IF; END $$;"]
    for history in data:
        user = history.user
        fields = user.model_dump()
        columns = ", ".join(fields)
        values = ", ".join(literal(v) for v in fields.values())
        updates = ", ".join(f"{k}=EXCLUDED.{k}" for k in fields if k != "id")
        lines.append(f"INSERT INTO users ({columns}) VALUES ({values}) ON CONFLICT (id) DO UPDATE SET {updates};")
        for table in ("drinks", "alcohol", "sleep_nights", "hr_checks"):
            lines.append(f"DELETE FROM {table} WHERE user_id={user.id};")
        for table, entries in (("drinks", history.drinks), ("alcohol", history.alcohol), ("sleep_nights", history.nights)):
            for entry in entries:
                fields = entry.model_dump()
                lines.append(f"INSERT INTO {table} ({', '.join(fields)}) VALUES ({', '.join(literal(v) for v in fields.values())});")
    lines += ["SELECT setval(pg_get_serial_sequence('users','id'), GREATEST((SELECT MAX(id) FROM users), (SELECT last_value FROM users_id_seq)), true);",
              "COMMIT;",
              "CALL refresh_continuous_aggregate('daily_caffeine', NULL, date_trunc('day', now()));"]
    return "\n".join(lines) + "\n"

if __name__ == "__main__":
    import argparse
    from pathlib import Path
    parser = argparse.ArgumentParser(description="Export M8 demo histories as standalone SQL")
    parser.add_argument("--export", type=Path, required=True)
    args = parser.parse_args()
    args.export.write_text(seed_sql(histories(get_now())), encoding="utf-8")

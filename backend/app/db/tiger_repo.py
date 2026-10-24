"""Psycopg 3 pooled implementation of the frozen Repo protocol."""
from datetime import date, datetime, time, timedelta, timezone
import os

from psycopg import errors, sql
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from app.types import Alcohol, Drink, HrCheck, SleepNight, User


class TigerRepo:
    def __init__(self, database_url: str | None = None):
        url = database_url or os.environ.get("DATABASE_URL")
        if not url:
            raise ValueError("DATABASE_URL is required")
        self.pool = ConnectionPool(url, min_size=1, max_size=4, open=False,
                                   kwargs={"row_factory": dict_row})
        self.pool.open(wait=True, timeout=10)

    def close(self):
        self.pool.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()

    def create_user(self, u: User) -> User:
        data = u.model_dump()
        if u.id <= 0:
            del data["id"]
        try:
            with self.pool.connection() as conn:
                # Coordinate explicit demo IDs and serial IDs in one transaction.
                conn.execute("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE")
                fields = list(data)
                row = conn.execute(sql.SQL("INSERT INTO users ({}) VALUES ({}) RETURNING *").format(
                    sql.SQL(", ").join(map(sql.Identifier, fields)),
                    sql.SQL(", ").join(sql.Placeholder() for _ in fields)),
                    list(data.values())).fetchone()
                conn.execute("SELECT setval(pg_get_serial_sequence('users', 'id'), "
                             "GREATEST((SELECT MAX(id) FROM users), "
                             "(SELECT last_value FROM users_id_seq)), true)")
                return User.model_validate(row)
        except errors.UniqueViolation as exc:
            raise ValueError(f"User {u.id} already exists") from exc

    def get_user(self, id: int) -> User | None:
        with self.pool.connection() as conn:
            row = conn.execute("SELECT * FROM users WHERE id = %s", (id,)).fetchone()
            return User.model_validate(row) if row else None

    def update_user(self, id: int, **fields) -> User:
        if set(fields) - (set(User.model_fields) - {"id"}):
            raise ValueError("Unknown or immutable user field")
        with self.pool.connection() as conn:
            row = conn.execute("SELECT * FROM users WHERE id = %s FOR UPDATE", (id,)).fetchone()
            if row is None:
                raise KeyError(id)
            validated = User.model_validate({**row, **fields})
            if not fields:
                return validated
            data = validated.model_dump()
            row = conn.execute(sql.SQL("UPDATE users SET {} WHERE id = %s RETURNING *").format(
                sql.SQL(", ").join(sql.SQL("{} = %s").format(sql.Identifier(k)) for k in fields)),
                [data[k] for k in fields] + [id]).fetchone()
            return User.model_validate(row)

    def list_users(self) -> list[User]:
        with self.pool.connection() as conn:
            return [User.model_validate(r) for r in conn.execute("SELECT * FROM users ORDER BY id")]

    def _insert(self, table, value):
        data = value.model_dump()
        with self.pool.connection() as conn:
            if not conn.execute("SELECT id FROM users WHERE id = %s", (value.user_id,)).fetchone():
                raise KeyError(value.user_id)
            row = conn.execute(sql.SQL("INSERT INTO {} ({}) VALUES ({}) RETURNING *").format(
                sql.Identifier(table), sql.SQL(", ").join(map(sql.Identifier, data)),
                sql.SQL(", ").join(sql.Placeholder() for _ in data)), list(data.values())).fetchone()
            return type(value).model_validate(row)

    def add_drink(self, d: Drink) -> Drink:
        return self._insert("drinks", d)

    def add_alcohol(self, a: Alcohol) -> Alcohol:
        return self._insert("alcohol", a)

    def add_hr(self, h: HrCheck) -> HrCheck:
        return self._insert("hr_checks", h)

    def _list(self, table, model, user_id, start, end):
        with self.pool.connection() as conn:
            rows = conn.execute(sql.SQL("SELECT * FROM {} WHERE user_id = %s "
                                       "AND time >= %s AND time < %s ORDER BY time").format(
                                           sql.Identifier(table)), (user_id, start, end))
            return [model.model_validate(r) for r in rows]

    def list_drinks(self, user_id: int, start: datetime, end: datetime) -> list[Drink]:
        return self._list("drinks", Drink, user_id, start, end)

    def list_alcohol(self, user_id: int, start: datetime, end: datetime) -> list[Alcohol]:
        return self._list("alcohol", Alcohol, user_id, start, end)

    def upsert_sleep(self, s: SleepNight) -> SleepNight:
        with self.pool.connection() as conn:
            if not conn.execute("SELECT id FROM users WHERE id = %s", (s.user_id,)).fetchone():
                raise KeyError(s.user_id)
            row = conn.execute(
                "INSERT INTO sleep_nights (night, user_id, bedtime, latency_min, rested_1to5) "
                "VALUES (%s, %s, %s, %s, %s) ON CONFLICT (user_id, night) DO UPDATE SET "
                "bedtime = EXCLUDED.bedtime, latency_min = EXCLUDED.latency_min, "
                "rested_1to5 = EXCLUDED.rested_1to5 RETURNING *",
                (s.night, s.user_id, s.bedtime, s.latency_min, s.rested_1to5)).fetchone()
            return SleepNight.model_validate(row)

    def list_sleep(self, user_id: int) -> list[SleepNight]:
        with self.pool.connection() as conn:
            return [SleepNight.model_validate(r) for r in conn.execute(
                "SELECT * FROM sleep_nights WHERE user_id = %s ORDER BY night", (user_id,))]

    def daily_total_mg(self, user_id: int, day: date) -> float:
        start = datetime.combine(day, time(), timezone.utc)
        with self.pool.connection() as conn:
            row = conn.execute("SELECT COALESCE(SUM(total_mg), 0) AS total FROM daily_caffeine "
                               "WHERE user_id = %s AND day >= %s AND day < %s",
                               (user_id, start, start + timedelta(days=1))).fetchone()
            return float(row["total"])

    def reset_user(self, user_id: int) -> None:
        with self.pool.connection() as conn:
            # Serialize the reset against concurrent user changes.
            conn.execute("SELECT id FROM users WHERE id = %s FOR UPDATE", (user_id,))
            bounds = conn.execute("SELECT MIN(time) AS lo, MAX(time) AS hi FROM drinks "
                                  "WHERE user_id = %s", (user_id,)).fetchone()
            for table in ("drinks", "alcohol", "sleep_nights", "hr_checks"):
                conn.execute(sql.SQL("DELETE FROM {} WHERE user_id = %s").format(
                    sql.Identifier(table)), (user_id,))
        # Real-time aggregates do not automatically re-read materialized history.
        # Refresh deleted historical buckets as well as clearing raw rows.
        if bounds["lo"] is not None:
            start = bounds["lo"].astimezone(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            end = bounds["hi"].astimezone(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
            # Leave today's bucket unmaterialized, so new drinks stay visible
            # immediately through real-time aggregation after the reset.
            end = min(end, datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0))
            if start < end:
                with self.pool.connection() as conn:
                    conn.autocommit = True
                    try:
                        conn.execute("CALL refresh_continuous_aggregate('daily_caffeine', %s::timestamptz, "
                                     "%s::timestamptz)", (start, end))
                    finally:
                        conn.autocommit = False

"""Thread-safe, detached in-memory storage for offline use."""
from datetime import date, datetime, time, timedelta, timezone
from threading import RLock

from app.types import Alcohol, Drink, HrCheck, SleepNight, User


class MemoryRepo:
    def __init__(self):
        self._lock = RLock()
        self._users = {1: User(id=1, name="You", bedtime=time(23, 30),
                              smoker=False, hormonal_bc=False)}
        self._drinks = []
        self._alcohol = []
        self._sleep = {}
        self._hr = []
        self._next_id = 2

    def create_user(self, u: User) -> User:
        with self._lock:
            id = u.id if u.id > 0 else self._next_id
            if id in self._users:
                raise ValueError(f"User {id} already exists")
            result = u.model_copy(update={"id": id}, deep=True)
            self._users[id] = result
            self._next_id = max(self._next_id, id + 1)
            return result.model_copy(deep=True)

    def get_user(self, id: int) -> User | None:
        with self._lock:
            u = self._users.get(id)
            return u.model_copy(deep=True) if u else None

    def update_user(self, id: int, **fields) -> User:
        with self._lock:
            self._require_user(id)
            if set(fields) - (set(User.model_fields) - {"id"}):
                raise ValueError("Unknown or immutable user field")
            u = User.model_validate({**self._users[id].model_dump(), **fields})
            self._users[id] = u
            return u.model_copy(deep=True)

    def list_users(self) -> list[User]:
        with self._lock:
            return [self._users[id].model_copy(deep=True) for id in sorted(self._users)]

    def _require_user(self, id):
        if id not in self._users:
            raise KeyError(id)

    def _add(self, collection, value):
        with self._lock:
            self._require_user(value.user_id)
            collection.append(value.model_copy(deep=True))
            return value.model_copy(deep=True)

    def add_drink(self, d: Drink) -> Drink:
        return self._add(self._drinks, d)

    def add_alcohol(self, a: Alcohol) -> Alcohol:
        return self._add(self._alcohol, a)

    def add_hr(self, h: HrCheck) -> HrCheck:
        return self._add(self._hr, h)

    def _list(self, collection, user_id, start, end):
        with self._lock:
            return [v.model_copy(deep=True) for v in sorted(collection, key=lambda v: v.time)
                    if v.user_id == user_id and start <= v.time < end]

    def list_drinks(self, user_id: int, start: datetime, end: datetime) -> list[Drink]:
        return self._list(self._drinks, user_id, start, end)

    def list_alcohol(self, user_id: int, start: datetime, end: datetime) -> list[Alcohol]:
        return self._list(self._alcohol, user_id, start, end)

    def upsert_sleep(self, s: SleepNight) -> SleepNight:
        with self._lock:
            self._require_user(s.user_id)
            self._sleep[s.user_id, s.night] = s.model_copy(deep=True)
            return s.model_copy(deep=True)

    def list_sleep(self, user_id: int) -> list[SleepNight]:
        with self._lock:
            return [v.model_copy(deep=True) for _, v in
                    sorted(self._sleep.items()) if v.user_id == user_id]

    def daily_total_mg(self, user_id: int, day: date) -> float:
        start = datetime.combine(day, time(), timezone.utc)
        with self._lock:
            return float(sum(d.mg for d in self.list_drinks(user_id, start, start + timedelta(days=1))))

    def delete_drinks(self, user_id: int, times: list[datetime]) -> int:
        drop = set(times)
        with self._lock:
            before = len(self._drinks)
            self._drinks[:] = [d for d in self._drinks if not (d.user_id == user_id and d.time in drop)]
            return before - len(self._drinks)

    def delete_sleep(self, user_id: int, nights: list[date]) -> int:
        with self._lock:
            keys = [(user_id, n) for n in set(nights) if (user_id, n) in self._sleep]
            for key in keys:
                del self._sleep[key]
            return len(keys)

    def reset_user(self, user_id: int) -> None:
        with self._lock:
            for collection in (self._drinks, self._alcohol, self._hr):
                collection[:] = [v for v in collection if v.user_id != user_id]
            self._sleep = {k: v for k, v in self._sleep.items() if v.user_id != user_id}

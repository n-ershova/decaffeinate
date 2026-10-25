"""Password authentication, opaque cookie sessions and per-request ownership."""
from contextvars import ContextVar
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets
from threading import RLock
from time import monotonic

from fastapi import Depends, HTTPException, Request
from app.deps import get_repo, setting
from app.types import User

COOKIE = "decaffeinate_session"
SESSION_DAYS = 7
current_user: ContextVar[int | None] = ContextVar("current_user", default=None)

DDL = """
CREATE TABLE IF NOT EXISTS auth_accounts (
 email TEXT PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
 password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS auth_sessions (
 token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
 expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_sessions_expiry ON auth_sessions(expires_at);
"""

def password_hash(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 600_000).hex()
    return f"{salt}${digest}"

def authorize_user(user_id: int):
    owner = current_user.get()
    if owner is not None and owner != user_id:
        raise HTTPException(403, "This profile belongs to another account")

class AuthStore:
    def __init__(self, repo):
        self.repo = repo
        self.lock = RLock()
        self.accounts = {}
        self.sessions = {}
        self.attempts = {}
        # A missing account still performs the same slow hash as a real one.
        self.dummy_hash = "00" * 16 + "$" + "00" * 32
        if hasattr(repo, "pool"):
            with repo.pool.connection() as conn:
                conn.execute(DDL)

    def throttle(self, address):
        now = monotonic()
        with self.lock:
            self.attempts = {key: values for key, values in self.attempts.items() if values[-1] > now - 900}
            values = [t for t in self.attempts.get(address, []) if t > now - 900]
            if len(values) >= 30:
                raise HTTPException(429, "Too many attempts. Try again in 15 minutes.")
            self.attempts[address] = values + [now]

    def register(self, email, password, profile):
        hashed = password_hash(password)
        if hasattr(self.repo, "pool"):
            from psycopg.errors import UniqueViolation
            try:
                with self.repo.pool.connection() as conn:
                    conn.execute("LOCK TABLE users IN SHARE ROW EXCLUSIVE MODE")
                    row = conn.execute("INSERT INTO users (id,name,bedtime,smoker,hormonal_bc) "
                                       "SELECT GREATEST(COALESCE(MAX(id),3),3)+1,%s,%s,%s,%s FROM users RETURNING *",
                                       (profile["name"], profile["bedtime"], profile["smoker"], profile["hormonal_bc"])).fetchone()
                    conn.execute("INSERT INTO auth_accounts VALUES (%s,%s,%s)", (email, row["id"], hashed))
                    conn.execute("SELECT setval(pg_get_serial_sequence('users','id'), (SELECT MAX(id) FROM users), true)")
                    return User.model_validate(row)
            except UniqueViolation:
                raise HTTPException(409, "An account with this email already exists") from None
        with self.lock:
            if email in self.accounts:
                raise HTTPException(409, "An account with this email already exists")
            user = self.repo.create_user(User(id=max([3] + [u.id for u in self.repo.list_users()]) + 1, **profile))
            self.accounts[email] = (user.id, hashed)
            return user

    def login(self, email, password):
        if hasattr(self.repo, "pool"):
            with self.repo.pool.connection() as conn:
                row = conn.execute("SELECT user_id,password_hash FROM auth_accounts WHERE email=%s", (email,)).fetchone()
                account = (row["user_id"], row["password_hash"]) if row else None
        else:
            account = self.accounts.get(email)
        hashed = account[1] if account else self.dummy_hash
        valid = hmac.compare_digest(password_hash(password, hashed.split("$")[0]), hashed)
        if not valid or not account:
            raise HTTPException(401, "Email or password is incorrect")
        return self.repo.get_user(account[0])

    def session(self, user_id):
        token = secrets.token_urlsafe(32)
        digest = hashlib.sha256(token.encode()).hexdigest()
        expires = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
        if hasattr(self.repo, "pool"):
            with self.repo.pool.connection() as conn:
                conn.execute("DELETE FROM auth_sessions WHERE expires_at <= now()")
                conn.execute("INSERT INTO auth_sessions VALUES (%s,%s,%s)", (digest, user_id, expires))
        else:
            with self.lock:
                self.sessions[digest] = (user_id, expires)
        return token

    def resolve(self, token):
        digest = hashlib.sha256(token.encode()).hexdigest()
        if hasattr(self.repo, "pool"):
            with self.repo.pool.connection() as conn:
                row = conn.execute("SELECT user_id FROM auth_sessions WHERE token_hash=%s AND expires_at>now()", (digest,)).fetchone()
                return row["user_id"] if row else None
        with self.lock:
            value = self.sessions.get(digest)
            return value[0] if value and value[1] > datetime.now(timezone.utc) else None

    def revoke(self, token):
        digest = hashlib.sha256(token.encode()).hexdigest()
        if hasattr(self.repo, "pool"):
            with self.repo.pool.connection() as conn:
                conn.execute("DELETE FROM auth_sessions WHERE token_hash=%s", (digest,))
        else:
            with self.lock:
                self.sessions.pop(digest, None)

_store_lock = RLock()
def get_auth_store(repo=Depends(get_repo)):
    with _store_lock:
        if not hasattr(repo, "_auth_store"):
            repo._auth_store = AuthStore(repo)
        return repo._auth_store

def allowed_origins():
    return [v.strip() for v in setting("FRONTEND_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if v.strip()]

def check_origin(request):
    origin = request.headers.get("origin")
    if origin and origin not in allowed_origins():
        raise HTTPException(403, "Untrusted origin")
    if request.headers.get("sec-fetch-site") == "cross-site":
        raise HTTPException(403, "Cross-site request rejected")

async def protect(request: Request, store=Depends(get_auth_store)):
    check_origin(request)
    user_id = store.resolve(request.cookies.get(COOKIE, ""))
    if user_id is None:
        raise HTTPException(401, "Sign in to continue")
    if request.url.path == "/users" or request.url.path.startswith("/demo"):
        raise HTTPException(403, "Account profiles are managed through sign-in")
    token = current_user.set(user_id)
    try:
        yield user_id
    finally:
        current_user.reset(token)

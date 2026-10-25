"""Signs the desk machine in as one account (§8.3).

Since accounts landed, GET /state and POST /drinks/identify need the
decaffeinate_session cookie. The machine logs in with an ordinary account's
email and password, keeps the cookie, and signs in again by itself whenever
the backend answers 401 (session expired, or a REPO=memory backend restarted).

Standard library only (urllib), like state_loop.py.

Env: HALFLIFE_EMAIL, HALFLIFE_PASSWORD.
"""
import http.cookiejar
import json
import os
import time
import urllib.error
import urllib.request

class LoginFailed(RuntimeError):
    pass


class _Relogin(urllib.request.BaseHandler):
    """On a 401, sign in again and repeat the request once."""

    def __init__(self, session):
        self.session = session

    def http_error_401(self, req, fp, code, msg, headers):
        if getattr(req, "_relogged", False) or req.full_url == self.session.login_url:
            return None            # fall through: the caller sees the 401
        if not self.session.may_retry():
            return None
        fp.close()
        self.session.login()
        req._relogged = True
        req.remove_header("Cookie")    # else the stale cookie is sent again
        return self.parent.open(req, timeout=req.timeout)


class Session:
    def __init__(self, api, email=None, password=None, retry_after_s=60.0):
        self.api = api.rstrip("/")
        self.login_url = f"{self.api}/auth/login"
        self.email = email if email is not None else os.getenv("HALFLIFE_EMAIL", "")
        self.password = password if password is not None else os.getenv("HALFLIFE_PASSWORD", "")
        # Logins are rate limited per IP, so a wrong password must not be retried every poll.
        self.retry_after_s = retry_after_s
        self.user_id = None
        self._failed_at = None
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()), _Relogin(self))

    def may_retry(self):
        return self._failed_at is None or time.monotonic() - self._failed_at >= self.retry_after_s

    def login(self, timeout_s=5.0):
        """Sign in and return the account's user id. Raises LoginFailed or a network error."""
        if not self.email or not self.password:
            raise LoginFailed("set HALFLIFE_EMAIL and HALFLIFE_PASSWORD to the account the machine logs to")
        body = json.dumps({"email": self.email, "password": self.password}).encode()
        req = urllib.request.Request(self.login_url, data=body, method="POST",
                                     headers={"Content-Type": "application/json"})
        try:
            with self.opener.open(req, timeout=timeout_s) as r:
                user = json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            self._failed_at = time.monotonic()
            raise LoginFailed(f"login refused ({e.code}): check HALFLIFE_EMAIL and HALFLIFE_PASSWORD") from None
        except Exception:
            self._failed_at = time.monotonic()
            raise
        self._failed_at = None
        self.user_id = int(user["id"])
        return self.user_id

    def open(self, req, timeout):
        """Like urllib.request.urlopen, but signed in."""
        return self.opener.open(req, timeout=timeout)

"""Tests for H5 · uploader.py and session.py against a fake backend."""
import json
import os
import sys
import threading
from email.parser import BytesParser
from email.policy import default
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import cv2
import numpy as np
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from detector import Box  # noqa: E402
from session import LoginFailed, Session  # noqa: E402
from uploader import crop, describe, upload_crop  # noqa: E402

RESULT = {"gemini": {"drink": "milk_coffee", "confidence": 0.9, "analysis": {"verdict": "Oat latte"}},
          "estimate": {"drink_key": "milk_coffee", "mg": 130, "auto_accept": True}, "logged": {"id": 1}}


class FakeBackend:
    """Accounts like the real one: /auth/login sets a cookie, /drinks/identify needs it."""

    def __init__(self):
        self.token = "t1"
        self.logins = 0
        self.uploads = []
        backend = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *a):
                pass

            def _send(self, code, body, cookie=None):
                data = json.dumps(body).encode()
                self.send_response(code)
                self.send_header("Content-Type", "application/json")
                if cookie:
                    self.send_header("Set-Cookie", f"decaffeinate_session={cookie}; HttpOnly; Path=/")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)

            def do_POST(self):
                body = self.rfile.read(int(self.headers["Content-Length"]))
                if self.path == "/auth/login":
                    creds = json.loads(body)
                    if creds != {"email": "me@example.com", "password": "correct horse"}:
                        return self._send(401, {"detail": "Email or password is incorrect"})
                    backend.logins += 1
                    return self._send(200, {"id": 4, "name": "Me"}, cookie=backend.token)
                if f"decaffeinate_session={backend.token}" not in (self.headers.get("Cookie") or ""):
                    return self._send(401, {"detail": "Sign in to continue"})
                msg = BytesParser(policy=default).parsebytes(
                    b"Content-Type: " + self.headers["Content-Type"].encode() + b"\r\n\r\n" + body)
                backend.uploads.append({p.get_param("name", header="content-disposition"): p.get_content()
                                        for p in msg.iter_parts()})
                self._send(200, RESULT)

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.api = f"http://127.0.0.1:{self.server.server_port}"
        threading.Thread(target=self.server.serve_forever, daemon=True).start()


@pytest.fixture
def backend():
    b = FakeBackend()
    yield b
    b.server.shutdown()


def frame():
    f = np.zeros((480, 640, 3), dtype=np.uint8)
    f[100:300, 200:400] = (0, 0, 255)       # the "drink": a red square
    return f


def test_crop_pads_ten_percent_and_clips():
    f = frame()
    assert crop(f, Box(200, 100, 400, 300, "cup", 1)).shape == (240, 240, 3)
    assert crop(f, Box(0, 0, 100, 100, "cup", 1)).shape == (110, 110, 3)


def test_sends_only_the_crop(backend):
    s = Session(backend.api, "me@example.com", "correct horse")
    s.login()
    result = upload_crop(frame(), Box(200, 100, 400, 300, "cup", 1), backend.api, s.user_id, session=s)
    assert result == RESULT
    sent = backend.uploads[0]
    assert sent["source"] == "jetson" and sent["user_id"] == "4"
    img = cv2.imdecode(np.frombuffer(sent["image"], np.uint8), cv2.IMREAD_COLOR)
    assert img.shape == (240, 240, 3)       # the padded crop, not the 640x480 frame
    assert img[120, 120, 2] > 200           # and it's the red drink


def test_signs_in_again_when_the_session_expires(backend):
    s = Session(backend.api, "me@example.com", "correct horse")
    s.login()
    backend.token = "t2"                    # e.g. a REPO=memory backend restarted
    assert upload_crop(frame(), Box(200, 100, 400, 300, "cup", 1), backend.api, 4, session=s) == RESULT
    assert backend.logins == 2


def test_wrong_password_is_reported_and_not_hammered(backend):
    s = Session(backend.api, "me@example.com", "wrong")
    with pytest.raises(LoginFailed):
        s.login()
    assert not s.may_retry()


def test_missing_credentials():
    with pytest.raises(LoginFailed):
        Session("http://127.0.0.1:9", "", "").login()


def test_upload_failure_returns_none(backend):
    assert upload_crop(frame(), Box(200, 100, 400, 300, "cup", 1), backend.api, 4) is None   # no session


def test_describe():
    assert describe(RESULT) == "logged Oat latte: 130 mg"
    assert "not logged" in describe({**RESULT, "logged": None})
    assert describe(None) == "upload failed"


def test_describe_repeat():
    repeat = {**RESULT, "logged": None, "repeat": {"time": "2026-10-25T07:49:58+00:00"}}
    assert describe(repeat) == "Oat latte was already logged at 07:49; not counted again"

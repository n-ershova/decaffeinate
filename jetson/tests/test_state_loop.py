"""Tests for H2 · state_loop.py, using a fake /state server and a fake Led."""
import json
import os
import socket
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from state_loop import run_state_loop  # noqa: E402

FAST = dict(interval_s=0.05, timeout_s=0.5, blink_s=0.05)


class FakeLed:
    def __init__(self):
        self.calls = []
        self._lock = threading.Lock()

    def set(self, color):
        with self._lock:
            self.calls.append(color)

    def flash(self, color="white", ms=300):
        pass

    def snapshot(self):
        with self._lock:
            return list(self.calls)


class FakeBackend:
    """Tiny http.server returning fixture JSON. Change .led or .status mid-test."""

    def __init__(self):
        self.led = "green"
        self.status = 200
        self.body = None          # raw bytes override, for bad-JSON tests
        self.paths = []
        backend = self

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                backend.paths.append(self.path)
                body = backend.body or json.dumps({
                    "now_mg": 142, "led": backend.led, "daily_total_mg": 195, "cap_mg": 400,
                }).encode()
                self.send_response(backend.status)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(body)

            def log_message(self, *a):
                pass

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.api = f"http://127.0.0.1:{self.server.server_port}"
        threading.Thread(target=self.server.serve_forever, daemon=True).start()

    def close(self):
        self.server.shutdown()
        self.server.server_close()


def wait_until(pred, timeout=3.0):
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        if pred():
            return True
        time.sleep(0.01)
    return False


@pytest.fixture
def backend():
    b = FakeBackend()
    yield b
    b.close()


@pytest.fixture
def start_loop():
    threads = []

    def _start(api, led, **kw):
        stop = threading.Event()
        t = threading.Thread(target=run_state_loop, args=(api, led),
                             kwargs={**FAST, "stop": stop, **kw}, daemon=True)
        t.start()
        threads.append((t, stop))
        return t, stop

    yield _start
    for t, stop in threads:
        stop.set()
        t.join(2)


def test_colour_change(backend, start_loop):
    led = FakeLed()
    start_loop(backend.api, led)
    assert wait_until(lambda: led.snapshot()[-1:] == ["green"])
    backend.led = "red"
    assert wait_until(lambda: led.snapshot()[-1:] == ["red"])
    backend.led = "amber"
    assert wait_until(lambda: led.snapshot()[-1:] == ["amber"])
    # set() is only called on a change, not on every poll
    assert led.snapshot() == ["green", "red", "amber"]


def test_sends_user_id(backend, start_loop):
    led = FakeLed()
    start_loop(backend.api, led, user_id=2)
    assert wait_until(lambda: backend.paths)
    assert backend.paths[0] == "/state?user_id=2"


def test_offline_blinks_amber_then_recovers(backend, start_loop):
    led = FakeLed()
    start_loop(backend.api, led)
    assert wait_until(lambda: led.snapshot()[-1:] == ["green"])

    backend.status = 500
    # several on/off cycles of amber
    assert wait_until(lambda: led.snapshot().count("off") >= 3)
    after = led.snapshot()[1:]
    assert set(after) == {"amber", "off"}
    assert all(a != b for a, b in zip(after, after[1:]))   # strictly alternating

    backend.status = 200
    backend.led = "green"
    assert wait_until(lambda: led.snapshot()[-1:] == ["green"])


def test_no_blink_before_three_failures(backend, start_loop):
    led = FakeLed()
    backend.status = 500
    start_loop(backend.api, led, interval_s=0.2, max_failures=3)
    time.sleep(0.3)               # only ~2 polls have happened
    assert led.snapshot() == []
    assert wait_until(lambda: "amber" in led.snapshot())


def test_unreachable_backend_blinks():
    with socket.socket() as s:   # grab a free port, then close it so nothing listens
        s.bind(("127.0.0.1", 0))
        port = s.getsockname()[1]
    led = FakeLed()
    stop = threading.Event()
    t = threading.Thread(target=run_state_loop, args=(f"http://127.0.0.1:{port}", led),
                         kwargs={**FAST, "stop": stop}, daemon=True)
    t.start()
    try:
        assert wait_until(lambda: {"amber", "off"} <= set(led.snapshot()))
    finally:
        stop.set()
        t.join(2)


@pytest.mark.parametrize("body", [b"not json", b'{"led": "purple"}', b"[1, 2]"])
def test_bad_response_counts_as_failure(backend, start_loop, body):
    backend.body = body
    led = FakeLed()
    start_loop(backend.api, led)
    assert wait_until(lambda: "amber" in led.snapshot())


def test_stop_exits_cleanly(backend):
    led = FakeLed()
    stop = threading.Event()
    t = threading.Thread(target=run_state_loop, args=(backend.api, led),
                         kwargs={"interval_s": 2.0, "stop": stop}, daemon=True)
    t.start()
    assert wait_until(lambda: led.snapshot() == ["green"])
    stop.set()
    t.join(1.0)                   # well under one 2 s poll interval
    assert not t.is_alive()

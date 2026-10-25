"""Tests for speaker.py: fetches the announcement and plays it, never raises."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import speaker  # noqa: E402


class FakeLog:
    def __init__(self):
        self.lines = []

    def emit(self, kind, message):
        self.lines.append((kind, message))


def test_plays_the_fetched_audio(monkeypatch):
    played, asked = [], []
    monkeypatch.setattr(speaker, "player", lambda: ["play"])
    monkeypatch.setattr(speaker, "fetch_audio", lambda *a: asked.append(a[3:]) or b"ID3mp3")
    monkeypatch.setattr(speaker.subprocess, "run",
                        lambda cmd, **kw: played.append(open(cmd[1], "rb").read()))
    log = FakeLog()
    speaker.announce("http://api", None, 4, "Coca-Cola can", 32, log)
    assert asked == [("Coca-Cola can", 32)] and played == [b"ID3mp3"] and log.lines == []


def test_no_player_or_failed_fetch_is_logged_not_raised(monkeypatch):
    log = FakeLog()
    monkeypatch.setattr(speaker, "player", lambda: None)
    speaker.announce("http://api", None, 4, "Cola", 32, log)
    monkeypatch.setattr(speaker, "player", lambda: ["play"])

    def down(*a):
        raise ConnectionError

    monkeypatch.setattr(speaker, "fetch_audio", down)
    speaker.announce("http://api", None, 4, "Cola", 32, log)
    assert [k for k, _ in log.lines] == ["error", "error"]

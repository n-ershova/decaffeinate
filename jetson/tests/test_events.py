"""Tests for events.py: TrackWatch turns tracked boxes into page events."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from detector import Box  # noqa: E402
from events import TrackWatch  # noqa: E402


class FakeLog:
    def __init__(self):
        self.lines = []

    def emit(self, kind, message):
        self.lines.append((kind, message))


def cup(id, cls="cup"):
    return Box(0, 0, 10, 10, cls, 0.8, id)


def test_appear_class_change_and_leave_once_each():
    log = FakeLog()
    w = TrackWatch(log, lost_frames=3)
    for frame in [[cup(1)], [cup(1)], [cup(1, "bottle")], [], [], [], []]:
        w.update(frame)
    assert log.lines == [("track", "#1 cup appeared (0.80)"), ("track", "#1 now looks like a bottle"),
                         ("lost", "#1 bottle left")]


def test_a_short_dropout_is_silent():
    log = FakeLog()
    w = TrackWatch(log, lost_frames=3)
    for frame in [[cup(1)], [], [], [cup(1)], [cup(1)]]:
        w.update(frame)
    assert log.lines == [("track", "#1 cup appeared (0.80)")]

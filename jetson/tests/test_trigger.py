"""Tests for H4 · trigger.py on synthetic box sequences (no camera)."""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from detector import Box  # noqa: E402
from trigger import Trigger, iou  # noqa: E402

W, H = 640, 480
FPS = 15


def centred(dx=0, size=200, id=None):
    """A box in the middle of the frame, 200x200 = 13% of it."""
    x, y = W // 2 - size // 2 + dx, H // 2 - size // 2
    return Box(x, y, x + size, y + size, "cup", 0.9, id)


def run(trig, frames, start=0.0):
    """frames: list of box lists, one per frame at 15 FPS -> times the trigger fired."""
    fired = []
    for i, boxes in enumerate(frames):
        t = start + i / FPS
        if trig.update(boxes, W, H, t):
            fired.append(round(t, 2))
    return fired


def test_fires_after_one_second_held_still():
    assert run(Trigger(), [[centred()]] * 30) == [1.0]


def test_small_jitter_still_fires():
    frames = [[centred(dx=(i % 3) * 4)] for i in range(30)]
    assert len(run(Trigger(), frames)) == 1


def test_moving_drink_does_not_fire():
    # 10 px a frame: every frame overlaps the last by 90%, but it's still moving.
    frames = [[centred(dx=-150 + i * 10)] for i in range(30)]
    assert run(Trigger(), frames) == []


def test_too_small_does_not_fire():
    assert run(Trigger(), [[centred(size=100)]] * 30) == []     # 3% of the frame


def test_position_in_the_frame_does_not_matter():
    b = Box(0, 0, 250, 250, "cup", 0.9)     # in the corner, 20% of the frame
    assert run(Trigger(), [[b]] * 30) == [1.0]


def test_brief_dropout_keeps_the_hold():
    frames = [[centred()]] * 8 + [[]] * 2 + [[centred()]] * 20
    assert run(Trigger(), frames) == [1.0]


def test_long_dropout_restarts_the_hold():
    frames = [[centred()]] * 10 + [[]] * 10 + [[centred()]] * 20
    assert run(Trigger(), frames) == [2.33]     # 1 s after it came back at 1.33 s


def test_cooldown_then_untracked_drink_must_leave_first():
    held = [[centred()]] * (FPS * 14)                  # still held at 14 s: no second log
    fired = run(Trigger(), held + [[]] * FPS + [[centred()]] * (FPS * 2))
    assert fired == [1.0, 16.0]


def test_track_fires_once_however_long_it_is_held():
    assert run(Trigger(), [[centred(id=7)]] * (FPS * 25)) == [1.0]


def test_new_track_fires_after_cooldown():
    frames = [[centred(id=1)]] * (FPS * 5) + [[centred(id=2)]] * (FPS * 10)
    assert run(Trigger(), frames) == [1.0, 12.0]    # cooldown ends at 11 s, then a 1 s hold


def test_id_switch_restarts_the_hold():
    frames = [[centred(id=1)]] * 10 + [[centred(id=2)]] * 20
    assert run(Trigger(), frames) == [1.67]


def test_held_track_is_not_stolen_by_a_bigger_one():
    a, b = centred(id=1), centred(size=260, id=2)
    frames = [[a]] * 5 + [[b, a]] * 25
    trig = Trigger()
    hits = [trig.update(f, W, H, i / FPS) for i, f in enumerate(frames)]
    assert [h.id for h in hits if h] == [1]


def test_iou():
    a = Box(0, 0, 10, 10, "cup", 1)
    assert iou(a, a) == 1
    assert iou(a, Box(5, 0, 15, 10, "cup", 1)) == 50 / 150
    assert iou(a, Box(20, 20, 30, 30, "cup", 1)) == 0

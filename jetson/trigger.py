"""H4 · Trigger logic (§8.3).

Decides when a drink is deliberately held up to the camera. A box qualifies
when it covers at least 8% of the frame, i.e. it's held close; where in the
frame doesn't matter, since the machine has no screen to show a target zone.
The trigger fires once the qualifying box has stayed put
(IoU >= 0.6 with where the hold started) for 1 second, then waits a 10-second
cooldown. Comparing with the start rather than the previous frame means a
drink sliding slowly across the frame never counts as held.

With ByteTrack ids (Detector.track), the hold follows one track and each track
fires at most once, so a drink still held up after the cooldown isn't logged
twice. Without ids (Detector.detect), the drink must be put down for a
second before the next one can fire.

Pure logic: no camera, no clock (the caller passes t, in seconds).
"""
from collections import deque

from detector import Box


def iou(a, b):
    ix = max(0, min(a.x2, b.x2) - max(a.x1, b.x1))
    iy = max(0, min(a.y2, b.y2) - max(a.y1, b.y1))
    inter = ix * iy
    union = (a.x2 - a.x1) * (a.y2 - a.y1) + (b.x2 - b.x1) * (b.y2 - b.y1) - inter
    return inter / union if union > 0 else 0.0


def _area(b):
    return (b.x2 - b.x1) * (b.y2 - b.y1)


class Trigger:
    def __init__(self, min_area=0.08, min_iou=0.6, hold_s=1.0,
                 cooldown_s=10.0, grace_s=0.3, rearm_s=1.0):
        self.min_area = min_area
        self.min_iou = min_iou
        self.hold_s = hold_s
        self.cooldown_s = cooldown_s
        self.grace_s = grace_s      # a missed detection this short doesn't break the hold
        self.rearm_s = rearm_s      # without ids: how long the drink must be gone before the next
        self._prev = None           # last qualifying box
        self._anchor = None         # the box when the current hold started
        self._since = None          # when the current hold started
        self._seen = None           # when a qualifying box was last seen
        self._fired = None          # when the trigger last fired
        self._fired_id = None
        self._done = deque(maxlen=64)   # track ids that already fired

    def qualifies(self, b, w, h):
        return _area(b) / (w * h) >= self.min_area

    def _pick(self, ok):
        # Stay with the track being held, so a second drink entering can't steal the hold.
        if self._prev is not None and self._prev.id is not None:
            same = [b for b in ok if b.id == self._prev.id]
            if same:
                return same[0]
        return max(ok, key=_area) if ok else None

    def holding(self, t):
        """(box being held, fraction of hold_s done), or (None, 0) when nothing is."""
        if self._fired is not None or self._prev is None or self._since is None:
            return None, 0.0
        return self._prev, min(1.0, (t - self._since) / self.hold_s)

    def update(self, boxes: list[Box], frame_w: int, frame_h: int, t: float) -> Box | None:
        """Feed one frame's detections; returns the box once when a drink is held up."""
        ok = [b for b in boxes if self.qualifies(b, frame_w, frame_h) and b.id not in self._done]
        box = self._pick(ok)

        if self._fired is not None:
            if self._fired_id is None and box is not None:
                self._seen = t
            if t - self._fired < self.cooldown_s:
                return None
            if self._fired_id is None and t - self._seen < self.rearm_s:
                return None
            self._fired = self._fired_id = self._prev = self._since = None

        if box is None:
            if self._seen is None or t - self._seen > self.grace_s:
                self._prev = self._since = None
            return None

        if self._prev is None or box.id != self._prev.id or iou(box, self._anchor) < self.min_iou:
            self._since, self._anchor = t, box   # new, different or moved drink: start the hold again
        self._prev, self._seen = box, t
        if t - self._since >= self.hold_s:
            self._fired, self._fired_id = t, box.id
            if box.id is not None:
                self._done.append(box.id)
            return box
        return None

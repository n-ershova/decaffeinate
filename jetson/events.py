"""Activity log for the app's machine page (POST /machine/log).

emit() prints the line and queues it; a background thread posts it with the
signed-in session, so the camera loop never waits on the network. If the
backend is slow the queue fills and the oldest-waiting lines are dropped:
the page is a live view, nothing is lost that matters (drinks are logged by
/drinks/identify).
"""
import json
import queue
import threading
import urllib.request

KINDS = ("info", "track", "lost", "trigger", "logged", "unsure", "error")


class EventLog:
    def __init__(self, api, session, user_id, timeout_s=2.0, size=100):
        self.url = f"{api.rstrip('/')}/machine/log"
        self.session, self.user_id, self.timeout_s = session, user_id, timeout_s
        self.q = queue.Queue(maxsize=size)
        threading.Thread(target=self._send_loop, daemon=True, name="events").start()

    def emit(self, kind, message):
        print(f"[{kind}] {message}", flush=True)
        try:
            self.q.put_nowait({"user_id": self.user_id, "kind": kind, "message": message[:200]})
        except queue.Full:
            pass

    def _send_loop(self):
        while True:
            body = json.dumps(self.q.get()).encode()
            req = urllib.request.Request(self.url, data=body, method="POST",
                                         headers={"Content-Type": "application/json"})
            try:
                with self.session.open(req, self.timeout_s):
                    pass
            except Exception:
                pass    # best effort; the line was already printed


class TrackWatch:
    """Turns per-frame tracked boxes into 'appeared' / 'lost' events, once per change.

    A track missing for a frame or two is normal (ByteTrack keeps the id), so it
    only counts as gone after lost_frames frames without it.
    """

    # Longer than bytetrack.yaml's track_buffer (45), so a track ByteTrack can still
    # pick up again isn't reported as gone and then back.
    def __init__(self, log, lost_frames=60):
        self.log, self.lost_frames = log, lost_frames
        self.live = {}   # id -> [class, frames since last seen]

    def update(self, boxes):
        seen = {b.id: b for b in boxes if b.id is not None}
        for i, b in seen.items():
            if i not in self.live:
                self.log.emit("track", f"#{i} {b.cls} appeared ({b.conf:.2f})")
            elif self.live[i][0] != b.cls:
                self.log.emit("track", f"#{i} now looks like a {b.cls}")
            self.live[i] = [b.cls, 0]
        for i, entry in list(self.live.items()):
            if i in seen:
                continue
            entry[1] += 1
            if entry[1] >= self.lost_frames:
                self.log.emit("lost", f"#{i} {entry[0]} left")
                del self.live[i]

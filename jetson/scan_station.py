"""H7 · The desk machine's detection program (§8.3).

Camera loop -> Detector.track (YOLO + ByteTrack) -> Trigger -> upload_crop.
The backend's Gemini + lookup table identifies the drink and its caffeine and
logs it; the Jetson only finds the drink and sends its crop.

    python scan_station.py                  # auto-detect held-up drinks
    python scan_station.py --preview        # also show the camera with tracked boxes
    python scan_station.py --quiet          # don't say logged drinks out loud

Env: HALFLIFE_API (default http://localhost:8000), HALFLIFE_EMAIL and
HALFLIFE_PASSWORD (the account drinks are logged to), plus the detector's own
variables. What it sees and sends also appears on the app's machine page
(events.py -> POST /machine/log).
"""
import argparse
import os
import sys
import threading
import time

from events import EventLog, TrackWatch
from session import LoginFailed, Session
from speaker import announce
from uploader import describe, upload_crop

STATS_S = 30    # how often FPS and track counts go to the log


def sign_in(session):
    """Log in, retrying while the backend is unreachable. Exits on bad credentials."""
    while True:
        try:
            user_id = session.login()
            print(f"[station] signed in as {session.email} (user {user_id})", flush=True)
            return user_id
        except LoginFailed as e:
            sys.exit(f"[station] {e}")
        except Exception as e:
            print(f"[station] backend unreachable ({type(e).__name__}), retrying", flush=True)
            time.sleep(5)


def _upload(frame, box, api, user_id, session, log, speak):
    result = upload_crop(frame, box, api, user_id, session=session)
    kind = ("logged" if result and result.get("logged") else "info" if result and result.get("repeat")
            else "unsure" if result else "error")
    log.emit(kind, describe(result))
    if kind == "logged" and speak:
        # Only once Gemini's answer was confident enough to log: say what and how much.
        est = result.get("estimate") or {}
        verdict = ((result.get("gemini") or {}).get("analysis") or {}).get("verdict") or est.get("label", "a drink")
        announce(api, session, user_id, verdict, result["logged"]["mg"], log)


def _draw_preview(frame, boxes, trig, fps, t):
    """Each box green if it can trigger (orange if it's too small), and the hold progress."""
    import cv2

    h, w = frame.shape[:2]
    held, progress = trig.holding(t)
    for b in boxes:
        ok = trig.qualifies(b, w, h)
        area = (b.x2 - b.x1) * (b.y2 - b.y1) / (w * h)
        why = "" if ok else " too small"
        color = (0, 200, 0) if ok else (0, 140, 255)
        cv2.rectangle(frame, (b.x1, b.y1), (b.x2, b.y2), color, 3)
        label = f"#{b.id} {b.cls} {b.conf:.2f} {area:.0%}{why}"
        if held is not None and b.id == held.id:
            label += f" hold {progress:.0%}"
            bar = int((b.x2 - b.x1) * progress)
            cv2.rectangle(frame, (b.x1, b.y2 - 10), (b.x1 + bar, b.y2), (0, 200, 0), -1)
        cv2.putText(frame, label, (b.x1, max(30, b.y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 2)
    cv2.putText(frame, f"{fps:.1f} FPS", (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 2)


def run_detection(cap, api, user_id, session, log, preview=False, speak=True):
    from detector import Detector
    from trigger import Trigger

    det, trig, watch = Detector(), Trigger(), TrackWatch(log)
    log.emit("info", f"detector ready: {os.path.basename(det.path)} + ByteTrack; hold a drink up to the camera")
    fps, frames, t0, next_stats = 0.0, 0, time.monotonic(), time.monotonic() + STATS_S
    while True:
        ok, frame = cap.read()
        if not ok:
            log.emit("error", "camera stopped")
            return
        h, w = frame.shape[:2]
        boxes = det.track(frame)
        watch.update(boxes)
        box = trig.update(boxes, w, h, time.monotonic())
        if box:
            log.emit("trigger", f"#{box.id} {box.cls} held up, asking Gemini...")
            # Upload in the background: Gemini takes seconds, the camera shouldn't stall.
            threading.Thread(target=_upload, args=(frame.copy(), box, api, user_id, session, log, speak),
                             daemon=True).start()
        frames += 1
        if time.monotonic() - t0 >= 1.0:
            fps, frames, t0 = frames / (time.monotonic() - t0), 0, time.monotonic()
        if time.monotonic() >= next_stats:
            next_stats = time.monotonic() + STATS_S
            log.emit("info", f"{fps:.1f} FPS, {len(boxes)} drink(s) in view")
        if preview:
            import cv2

            _draw_preview(frame, boxes, trig, fps, time.monotonic())
            cv2.imshow("decaffeinate machine", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                return


def main():
    import cv2

    ap = argparse.ArgumentParser(description="Decaffeinate desk machine: drink detection")
    ap.add_argument("--api", default=os.getenv("HALFLIFE_API", "http://localhost:8000"))
    ap.add_argument("--camera", type=int, default=0)
    ap.add_argument("--preview", action="store_true", help="show the camera window (needs a display)")
    ap.add_argument("--quiet", action="store_true", help="don't announce logged drinks (ElevenLabs)")
    args = ap.parse_args()

    session = Session(args.api)
    user_id = sign_in(session)
    log = EventLog(args.api, session, user_id)
    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        log.emit("error", f"can't open camera {args.camera}")
        time.sleep(1)   # let the line reach the page
        sys.exit(1)
    try:
        run_detection(cap, args.api, user_id, session, log, args.preview, speak=not args.quiet)
    except KeyboardInterrupt:
        log.emit("info", "detection stopped")
        time.sleep(0.5)
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()

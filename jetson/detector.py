"""H3 · YOLO nano drink detector (§8.3).

Spots cups, bottles, wine glasses and cans in a webcam frame. The default
model is YOLOE nano (Ultralytics YOLOE-26n), which takes its classes as text,
because COCO (and so plain YOLO26n) has no "can" class. No custom training: the
backend (Gemini + lookup table) does the "which drink is it" part from the
crop. The detector only has to find a drink.

Tracking (track(), what the scan station uses): ByteTrack gives every drink
an id that survives across frames, including frames where the detector's score
dips (ByteTrack's second, low-score association). On top of that, each track's
box is smoothed, its class is a vote over its history (a mug flickering
between "cup" and "wine glass" stays a cup), and a track is only reported
after it has been seen in a few frames, so one-frame false positives never
reach the trigger. NMS is class-agnostic, so one object is never two boxes.

Model choice, first match wins:
  1. HALFLIFE_YOLO_MODEL env var, or the `model` argument (path or loaded model)
  2. jetson/models/yoloe-26n.engine   TensorRT FP16 with the classes baked in,
                                      built on the Jetson by export_engine.sh
  3. jetson/models/yoloe-26n-seg.pt   plain PyTorch, auto-downloaded; the laptop
                                      fallback (CPU, CUDA or Apple MPS)
A COCO model such as yolo26n.pt still works via HALFLIFE_YOLO_MODEL, without cans.

    python detector.py               # webcam preview with boxes + FPS, q quits
    python detector.py --headless    # no window, prints FPS (over SSH on the Jetson)
    python detector.py --camera 1    # another webcam
    python detector.py --no-track    # raw per-frame detections, for comparison

Env: HALFLIFE_YOLO_MODEL, HALFLIFE_YOLO_CONF (default 0.35),
     HALFLIFE_YOLO_IMGSZ (default 640, must match the engine's export size),
     HALFLIFE_TRACKER (ByteTrack config, default jetson/bytetrack.yaml).
"""
import os
import sys
import time
from dataclasses import dataclass

import numpy as np

DRINK_CLASSES = ("cup", "bottle", "wine glass", "can")   # COCO names (contract §0.6) + can
# Text prompts YOLOE matches each class against; "drink can" reads better than a bare "can".
PROMPTS = {"cup": "cup", "bottle": "bottle", "wine glass": "wine glass", "can": "drink can"}
HERE = os.path.dirname(os.path.abspath(__file__))
ENGINE_PATH = os.path.join(HERE, "models", "yoloe-26n.engine")
PT_MODEL = os.path.join(HERE, "models", "yoloe-26n-seg.pt")   # downloaded here on first use
TRACKER = os.path.join(HERE, "bytetrack.yaml")
LOW_CONF = 0.1   # ByteTrack needs low-score boxes for its second association; = track_low_thresh


@dataclass
class Box:
    x1: int
    y1: int
    x2: int
    y2: int
    cls: str
    conf: float
    id: int | None = None   # ByteTrack id from Detector.track(); None from detect()


def default_model_path():
    """Env override, else the TensorRT engine if it's been built, else the .pt."""
    env = os.getenv("HALFLIFE_YOLO_MODEL")
    if env:
        return env
    return ENGINE_PATH if os.path.exists(ENGINE_PATH) else PT_MODEL


def _np(x):
    """Ultralytics gives torch tensors (maybe on the GPU); tests give numpy."""
    return x.cpu().numpy() if hasattr(x, "cpu") else np.asarray(x)


class TrackSmoother:
    """Steadies ByteTrack output per track id: smoothed box, voted class, min age.

    alpha weights the newest box (lower = steadier, laggier). A track is
    reported once seen in min_hits frames, and forgotten after max_age frames
    without a match.
    """

    def __init__(self, alpha=0.5, min_hits=3, max_age=60):
        self.alpha, self.min_hits, self.max_age = alpha, min_hits, max_age
        self.tracks = {}   # id -> dict(xyxy, votes, conf, hits, last)
        self.frame = 0

    def reset(self):
        self.tracks.clear()
        self.frame = 0

    def update(self, rows, w, h):
        """rows: [(x1, y1, x2, y2, cls_name, conf, id)] from one frame -> smoothed Boxes."""
        self.frame += 1
        out = []
        for x1, y1, x2, y2, name, p, tid in rows:
            box = np.array([x1, y1, x2, y2], dtype=float)
            tr = self.tracks.get(tid)
            if tr is None:
                tr = self.tracks[tid] = dict(xyxy=box, votes={}, conf=float(p), hits=0)
            else:
                a = self.alpha
                tr["xyxy"] = a * box + (1 - a) * tr["xyxy"]
                tr["conf"] = a * float(p) + (1 - a) * tr["conf"]
            # Older votes fade, so a genuine class change still wins eventually.
            tr["votes"] = {k: v * 0.9 for k, v in tr["votes"].items()}
            tr["votes"][name] = tr["votes"].get(name, 0.0) + float(p)
            tr["hits"] += 1
            tr["last"] = self.frame
            if tr["hits"] < self.min_hits:
                continue
            bx1, by1, bx2, by2 = tr["xyxy"]
            bx1, bx2 = int(np.clip(bx1, 0, w)), int(np.clip(bx2, 0, w))
            by1, by2 = int(np.clip(by1, 0, h)), int(np.clip(by2, 0, h))
            if bx2 > bx1 and by2 > by1:
                cls = max(tr["votes"], key=tr["votes"].get)
                out.append(Box(bx1, by1, bx2, by2, cls, round(tr["conf"], 3), int(tid)))
        self.tracks = {k: v for k, v in self.tracks.items() if self.frame - v["last"] <= self.max_age}
        out.sort(key=lambda bx: bx.conf, reverse=True)
        return out


def load_model(path):
    from ultralytics import YOLO, YOLOE   # lazy: tests and the trigger don't need torch

    if "yoloe" in os.path.basename(path).lower():
        model = YOLOE(path)
        if not path.endswith(".engine"):   # an engine already has the classes baked in
            names = list(DRINK_CLASSES)
            # The text encoder (mobileclip2_b.ts, ~250 MB, fetched once) is saved in the
            # working directory, so work from models/ (git-ignored) wherever this runs from.
            cwd = os.getcwd()
            os.chdir(os.path.join(HERE, "models"))
            try:
                model.set_classes(names, model.get_text_pe([PROMPTS[n] for n in names]))
            finally:
                os.chdir(cwd)
        return model
    # task= stops Ultralytics guessing (and warning) for .engine files
    return YOLO(path, task="detect")


class Detector:
    def __init__(self, model=None, conf=None, imgsz=None, device=None, tracker=None, smoother=None):
        if model is None or isinstance(model, str):
            self.path = model or default_model_path()
            model = load_model(self.path)
        else:
            self.path = type(model).__name__
        self.model = model
        self.conf = float(conf if conf is not None else os.getenv("HALFLIFE_YOLO_CONF", "0.35"))
        self.imgsz = int(imgsz if imgsz is not None else os.getenv("HALFLIFE_YOLO_IMGSZ", "640"))
        self.device = device
        self.tracker = tracker or os.getenv("HALFLIFE_TRACKER") or TRACKER
        self.smoother = smoother or TrackSmoother()

        names = model.names   # {0: "person", ...}; an engine keeps them in its metadata
        self.names = names if isinstance(names, dict) else dict(enumerate(names))
        # Filter inside the model call rather than afterwards, so the other 77
        # COCO classes never reach NMS / post-processing.
        self.class_ids = [i for i, n in self.names.items() if n in DRINK_CLASSES]
        if not self.class_ids:
            raise ValueError(f"{self.path} has none of the classes {DRINK_CLASSES}")

    def _kwargs(self, conf):
        # agnostic_nms: a mug scored as both "cup" and "wine glass" stays one box.
        kwargs = dict(conf=conf, imgsz=self.imgsz, classes=self.class_ids, agnostic_nms=True, verbose=False)
        if self.device is not None:
            kwargs["device"] = self.device
        return kwargs

    def detect(self, frame: np.ndarray) -> list[Box]:
        """Drink boxes in pixel coords of `frame` (BGR, as OpenCV reads it), best first."""
        h, w = frame.shape[:2]
        result = self.model.predict(frame, **self._kwargs(self.conf))[0]

        b = result.boxes
        xyxy, cls, conf = _np(b.xyxy), _np(b.cls).astype(int), _np(b.conf)
        boxes = []
        for (x1, y1, x2, y2), c, p in zip(xyxy, cls, conf):
            name = self.names.get(int(c))
            if name not in DRINK_CLASSES or p < self.conf:
                continue
            x1, x2 = int(np.clip(x1, 0, w)), int(np.clip(x2, 0, w))
            y1, y2 = int(np.clip(y1, 0, h)), int(np.clip(y2, 0, h))
            if x2 > x1 and y2 > y1:
                boxes.append(Box(x1, y1, x2, y2, name, round(float(p), 3)))
        boxes.sort(key=lambda bx: bx.conf, reverse=True)
        return boxes

    def track(self, frame: np.ndarray) -> list[Box]:
        """Tracked, smoothed drink boxes with ids, best first. Call once per video frame, in order."""
        h, w = frame.shape[:2]
        result = self.model.track(frame, persist=True, tracker=self.tracker, **self._kwargs(LOW_CONF))[0]
        b = result.boxes
        if b is None or b.id is None:   # no confirmed tracks this frame
            return self.smoother.update([], w, h)
        rows = [(*xyxy, self.names.get(int(c)), float(p), int(i))
                for xyxy, c, p, i in zip(_np(b.xyxy), _np(b.cls).astype(int), _np(b.conf), _np(b.id))
                if self.names.get(int(c)) in DRINK_CLASSES]
        return self.smoother.update(rows, w, h)

    def reset(self):
        """Forget all tracks, e.g. after the camera was reopened."""
        trackers = getattr(getattr(self.model, "predictor", None), "trackers", None)
        for t in trackers or []:
            t.reset()
        self.smoother.reset()


def _draw(frame, boxes, fps):
    import cv2

    for b in boxes:
        cv2.rectangle(frame, (b.x1, b.y1), (b.x2, b.y2), (0, 200, 255), 2)
        tag = f"#{b.id} " if b.id is not None else ""
        cv2.putText(frame, f"{tag}{b.cls} {b.conf:.2f}", (b.x1, max(15, b.y1 - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 255), 2)
    cv2.putText(frame, f"{fps:.1f} FPS", (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)


if __name__ == "__main__":
    import argparse

    import cv2

    ap = argparse.ArgumentParser(description="Live drink detection preview / FPS check")
    ap.add_argument("--camera", type=int, default=0)
    ap.add_argument("--model", default=None)
    ap.add_argument("--headless", action="store_true", help="no window; print FPS once a second")
    ap.add_argument("--no-track", action="store_true", help="per-frame detect() instead of ByteTrack")
    args = ap.parse_args()

    det = Detector(args.model)
    print(f"[detector] model {det.path}, classes {[det.names[i] for i in det.class_ids]}", flush=True)
    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        sys.exit(f"[detector] can't open camera {args.camera}")

    fps, frames, t0 = 0.0, 0, time.monotonic()
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            boxes = det.detect(frame) if args.no_track else det.track(frame)
            frames += 1
            dt = time.monotonic() - t0
            if dt >= 1.0:
                fps, frames, t0 = frames / dt, 0, time.monotonic()
                if args.headless:
                    top = f"#{boxes[0].id} {boxes[0].cls} {boxes[0].conf:.2f}" if boxes else "-"
                    print(f"[detector] {fps:5.1f} FPS  {len(boxes)} drink(s)  top: {top}", flush=True)
            if not args.headless:
                _draw(frame, boxes, fps)
                cv2.imshow("halflife detector", frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
    except KeyboardInterrupt:
        pass
    finally:
        cap.release()
        cv2.destroyAllWindows()

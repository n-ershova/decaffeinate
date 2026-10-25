"""H3 · YOLO nano drink detector (§8.3).

Spots cups, bottles and wine glasses in a webcam frame using a pretrained
COCO YOLO nano model (Ultralytics YOLO26n). No custom training: COCO already
has the three classes we need, and the backend (Gemini + lookup table) does the
"which drink is it" part from the crop. The detector only has to find a drink.

Model choice, first match wins:
  1. HALFLIFE_YOLO_MODEL env var, or the `model` argument (path or loaded model)
  2. jetson/models/yolo26n.engine   TensorRT FP16, built on the Jetson by
                                    export_engine.sh (fast path, >= 15 FPS)
  3. jetson/models/yolo26n.pt       plain PyTorch, auto-downloaded; the laptop
                                    fallback (CPU, CUDA or Apple MPS)

    python detector.py               # webcam preview with boxes + FPS, q quits
    python detector.py --headless    # no window, prints FPS (over SSH on the Jetson)
    python detector.py --camera 1    # another webcam

Env: HALFLIFE_YOLO_MODEL, HALFLIFE_YOLO_CONF (default 0.35),
     HALFLIFE_YOLO_IMGSZ (default 640, must match the engine's export size).
"""
import os
import sys
import time
from dataclasses import dataclass

import numpy as np

DRINK_CLASSES = ("cup", "bottle", "wine glass")   # COCO names, contract §0.6
HERE = os.path.dirname(os.path.abspath(__file__))
ENGINE_PATH = os.path.join(HERE, "models", "yolo26n.engine")
PT_MODEL = os.path.join(HERE, "models", "yolo26n.pt")   # downloaded here on first use


@dataclass
class Box:
    x1: int
    y1: int
    x2: int
    y2: int
    cls: str
    conf: float


def default_model_path():
    """Env override, else the TensorRT engine if it's been built, else the .pt."""
    env = os.getenv("HALFLIFE_YOLO_MODEL")
    if env:
        return env
    return ENGINE_PATH if os.path.exists(ENGINE_PATH) else PT_MODEL


def _np(x):
    """Ultralytics gives torch tensors (maybe on the GPU); tests give numpy."""
    return x.cpu().numpy() if hasattr(x, "cpu") else np.asarray(x)


class Detector:
    def __init__(self, model=None, conf=None, imgsz=None, device=None):
        if model is None or isinstance(model, str):
            from ultralytics import YOLO   # lazy: tests and the trigger don't need torch

            self.path = model or default_model_path()
            # task= stops Ultralytics guessing (and warning) for .engine files
            model = YOLO(self.path, task="detect")
        else:
            self.path = type(model).__name__
        self.model = model
        self.conf = float(conf if conf is not None else os.getenv("HALFLIFE_YOLO_CONF", "0.35"))
        self.imgsz = int(imgsz if imgsz is not None else os.getenv("HALFLIFE_YOLO_IMGSZ", "640"))
        self.device = device

        names = model.names   # {0: "person", ...}; an engine keeps them in its metadata
        self.names = names if isinstance(names, dict) else dict(enumerate(names))
        # Filter inside the model call rather than afterwards, so the other 77
        # COCO classes never reach NMS / post-processing.
        self.class_ids = [i for i, n in self.names.items() if n in DRINK_CLASSES]
        if not self.class_ids:
            raise ValueError(f"{self.path} has none of the classes {DRINK_CLASSES}")

    def detect(self, frame: np.ndarray) -> list[Box]:
        """Drink boxes in pixel coords of `frame` (BGR, as OpenCV reads it), best first."""
        h, w = frame.shape[:2]
        kwargs = dict(conf=self.conf, imgsz=self.imgsz, classes=self.class_ids, verbose=False)
        if self.device is not None:
            kwargs["device"] = self.device
        result = self.model.predict(frame, **kwargs)[0]

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


def _draw(frame, boxes, fps):
    import cv2

    for b in boxes:
        cv2.rectangle(frame, (b.x1, b.y1), (b.x2, b.y2), (0, 200, 255), 2)
        cv2.putText(frame, f"{b.cls} {b.conf:.2f}", (b.x1, max(15, b.y1 - 6)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 255), 2)
    cv2.putText(frame, f"{fps:.1f} FPS", (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)


if __name__ == "__main__":
    import argparse

    import cv2

    ap = argparse.ArgumentParser(description="Live drink detection preview / FPS check")
    ap.add_argument("--camera", type=int, default=0)
    ap.add_argument("--model", default=None)
    ap.add_argument("--headless", action="store_true", help="no window; print FPS once a second")
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
            boxes = det.detect(frame)
            frames += 1
            dt = time.monotonic() - t0
            if dt >= 1.0:
                fps, frames, t0 = frames / dt, 0, time.monotonic()
                if args.headless:
                    top = f"{boxes[0].cls} {boxes[0].conf:.2f}" if boxes else "-"
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

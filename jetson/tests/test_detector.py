"""Tests for H3 · detector.py, using a fake YOLO model (no torch or camera needed)."""
import os
import sys
from types import SimpleNamespace

import numpy as np
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from detector import Box, Detector  # noqa: E402

COCO = {0: "person", 39: "bottle", 40: "wine glass", 41: "cup", 63: "laptop"}


class FakeYOLO:
    """Mimics ultralytics.YOLO: .names and .predict() -> [Results with .boxes]."""

    def __init__(self, rows, names=COCO):
        self.names = names
        self.rows = rows      # [(x1, y1, x2, y2, cls_id, conf), ...]
        self.kwargs = None

    def predict(self, frame, **kwargs):
        self.kwargs = kwargs
        a = np.array(self.rows, dtype=float).reshape(-1, 6)
        return [SimpleNamespace(boxes=SimpleNamespace(xyxy=a[:, :4], cls=a[:, 4], conf=a[:, 5]))]


FRAME = np.zeros((480, 640, 3), dtype=np.uint8)


def test_returns_drink_boxes_best_first():
    det = Detector(FakeYOLO([(10, 20, 110, 220, 41, 0.6), (300, 50, 380, 300, 39, 0.9)]))
    assert det.detect(FRAME) == [Box(300, 50, 380, 300, "bottle", 0.9), Box(10, 20, 110, 220, "cup", 0.6)]


def test_asks_model_for_drink_classes_only():
    model = FakeYOLO([])
    Detector(model, conf=0.4, imgsz=320).detect(FRAME)
    assert sorted(model.kwargs["classes"]) == [39, 40, 41]
    assert model.kwargs["conf"] == 0.4 and model.kwargs["imgsz"] == 320


def test_drops_non_drinks_and_low_confidence():
    # Even if the model ignores `classes=` (some exports do), people never come out.
    det = Detector(FakeYOLO([(0, 0, 50, 50, 0, 0.99), (0, 0, 50, 50, 41, 0.1), (0, 0, 50, 50, 40, 0.5)]), conf=0.35)
    assert [b.cls for b in det.detect(FRAME)] == ["wine glass"]


def test_clips_to_frame_and_drops_empty_boxes():
    det = Detector(FakeYOLO([(-5.4, -3, 700, 500, 41, 0.8), (650, 10, 700, 50, 39, 0.8)]))
    assert det.detect(FRAME) == [Box(0, 0, 640, 480, "cup", 0.8)]


def test_no_detections():
    assert Detector(FakeYOLO([])).detect(FRAME) == []


def test_names_as_list_work():
    names = ["x"] * 80
    names[41] = "cup"
    det = Detector(FakeYOLO([(1, 1, 9, 9, 41, 0.7)], names=names))
    assert det.detect(FRAME)[0].cls == "cup"


def test_model_without_drink_classes_is_rejected():
    with pytest.raises(ValueError):
        Detector(FakeYOLO([], names={0: "person"}))

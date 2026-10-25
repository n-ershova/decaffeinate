#!/usr/bin/env bash
# H3 · Build the TensorRT FP16 engine for detector.py. Run this ON the Jetson:
# a .engine is tied to the GPU and TensorRT version that built it, so it can't
# be built on a laptop or copied between JetPack versions. Takes a few minutes.
#
#   ./export_engine.sh            # 640 px input (detector.py default)
#   IMGSZ=320 ./export_engine.sh  # faster; then run with HALFLIFE_YOLO_IMGSZ=320
#
# Needs ultralytics plus NVIDIA's JetPack build of torch (not the PyPI one):
#   pip install ultralytics
set -euo pipefail
cd "$(dirname "$0")"

MODEL="${MODEL:-models/yoloe-26n-seg.pt}"   # downloaded on first run
IMGSZ="${IMGSZ:-640}"
mkdir -p models

python3 - "$MODEL" "$IMGSZ" <<'EOF'
import shutil, sys
from detector import load_model

model, imgsz = sys.argv[1], int(sys.argv[2])
# load_model sets YOLOE's text classes (cup, bottle, wine glass, can); the engine keeps them.
# half=True -> FP16; nano is accurate enough at FP16 and ~2x faster than FP32.
# Batch 1, static shape: we only ever run one webcam frame at a time.
out = load_model(model).export(format="engine", half=True, imgsz=imgsz, device=0, batch=1)
shutil.move(out, "models/yoloe-26n.engine")
print("[export] wrote jetson/models/yoloe-26n.engine")
EOF

echo "[export] now check FPS: python3 detector.py --headless   (go/no-go is >= 15)"

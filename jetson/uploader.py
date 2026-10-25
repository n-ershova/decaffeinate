"""H5 · Crop & upload client (§8.3).

Crops the drink's box plus 10% padding, encodes it as JPEG and sends it to
POST /drinks/identify with source=jetson. The backend runs Gemini and the
lookup table, and logs the drink if it's confident. Only the crop leaves the
device, never the full frame, so faces stay on the Jetson.
"""
import json
import uuid
import urllib.error
import urllib.request

import numpy as np

from detector import Box

PAD = 0.10


def crop(frame: np.ndarray, box: Box, pad: float = PAD) -> np.ndarray:
    h, w = frame.shape[:2]
    px, py = int((box.x2 - box.x1) * pad), int((box.y2 - box.y1) * pad)
    x1, y1 = max(0, box.x1 - px), max(0, box.y1 - py)
    x2, y2 = min(w, box.x2 + px), min(h, box.y2 + py)
    return frame[y1:y2, x1:x2]


def encode_jpeg(image: np.ndarray, quality: int = 90) -> bytes:
    import cv2   # lazy, like detector.py: the trigger and tests of it don't need OpenCV

    ok, buf = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, quality])
    if not ok:
        raise ValueError("JPEG encoding failed")
    return buf.tobytes()


def _multipart(fields: dict, jpeg: bytes):
    boundary = uuid.uuid4().hex
    parts = [f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
             for k, v in fields.items()]
    parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="drink.jpg"\r\n'
                 f"Content-Type: image/jpeg\r\n\r\n".encode() + jpeg + b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    return b"".join(parts), f"multipart/form-data; boundary={boundary}"


def upload_crop(frame: np.ndarray, box: Box, api: str, user_id: int = 1, *,
                session=None, timeout_s: float = 20.0) -> dict | None:
    """POST the crop; returns the /drinks/identify response, or None if it failed.

    Pass a session.Session: the route needs a signed-in account.
    """
    body, content_type = _multipart({"source": "jetson", "user_id": user_id},
                                    encode_jpeg(crop(frame, box)))
    req = urllib.request.Request(f"{api.rstrip('/')}/drinks/identify", data=body, method="POST",
                                 headers={"Content-Type": content_type})
    try:
        with (session.open(req, timeout_s) if session else urllib.request.urlopen(req, timeout=timeout_s)) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"[upload] /drinks/identify answered {e.code}", flush=True)
    except Exception as e:
        print(f"[upload] /drinks/identify failed: {type(e).__name__}", flush=True)
    return None


def describe(result: dict | None) -> str:
    """One console line for a /drinks/identify response."""
    if not result:
        return "upload failed"
    est = result.get("estimate") or {}
    verdict = ((result.get("gemini") or {}).get("analysis") or {}).get("verdict") or est.get("label", "?")
    if result.get("logged"):
        return f"logged {verdict}: {est.get('mg', 0):.0f} mg"
    if result.get("repeat"):
        at = result["repeat"]["time"][11:16]
        return f"{verdict} was already logged at {at}; not counted again"
    if est.get("drink_key") == "unknown":
        return "not recognised as a drink; nothing logged"
    # The backend only auto-logs confident scans whose caffeine is reliable (lookup.py).
    return f"{verdict} ({est.get('mg', 0):.0f} mg): not logged automatically, add it in the app"

"""Says a logged drink out loud on the machine's speaker (POST /machine/announce).

The backend turns "drink + mg" into a spoken Gemini remark via ElevenLabs (keys stay on the server);
this fetches the MP3 and plays it with whatever player the device has: afplay on a
Mac, mpg123 or ffplay on the Jetson (sudo apt install mpg123).
"""
import json
import shutil
import subprocess
import tempfile
import urllib.error
import urllib.request

PLAYERS = (
    ["afplay"],
    ["mpg123", "-q"],
    ["ffplay", "-nodisp", "-autoexit", "-loglevel", "quiet"],
)


def player():
    """The first available MP3 player command, or None."""
    for cmd in PLAYERS:
        if shutil.which(cmd[0]):
            return cmd
    return None


def fetch_audio(api, session, user_id, drink, mg, timeout_s=25.0):
    body = json.dumps({"user_id": user_id, "drink": drink[:120], "mg": mg}).encode()
    req = urllib.request.Request(f"{api.rstrip('/')}/machine/announce", data=body, method="POST",
                                 headers={"Content-Type": "application/json"})
    with session.open(req, timeout_s) as r:
        return r.read()


def announce(api, session, user_id, drink, mg, log):
    """Speak the backend's cheeky remark about this drink. Problems go to the log, never raise."""
    cmd = player()
    if cmd is None:
        log.emit("error", "can't announce: no audio player (install mpg123)")
        return
    try:
        audio = fetch_audio(api, session, user_id, drink, mg)
    except urllib.error.HTTPError as e:
        log.emit("error", f"announcement unavailable ({e.code})")
        return
    except Exception as e:
        log.emit("error", f"announcement failed: {type(e).__name__}")
        return
    with tempfile.NamedTemporaryFile(suffix=".mp3") as f:
        f.write(audio)
        f.flush()
        subprocess.run([*cmd, f.name], check=False, timeout=30,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

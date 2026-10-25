"""H2 · LED state loop (§8.3).

Polls the backend's GET /state every couple of seconds and shows its "led"
field (green / amber / red) on the desk LED. The backend decides the colour;
the Jetson only displays it.

Alongside, it POSTs /machine/heartbeat every poll so the app's machine page
can show the device as online. Heartbeats run in their own thread, so a slow
network never delays the LED.

If /state fails 3 times in a row (backend down, Wi-Fi gone, bad response),
the LED slowly blinks amber until the backend answers again, then returns to
the real colour.

Standard library only (urllib), so it runs unchanged on the Jetson and on a
laptop. On a laptop, led.py falls back to printing colours.

    HALFLIFE_API=http://192.168.1.20:8000 python state_loop.py
    python state_loop.py http://localhost:8000     # API as an argument instead

Env: HALFLIFE_API (default http://localhost:8000), HALFLIFE_USER_ID (default 1).
"""
import json
import os
import sys
import threading
import time
import urllib.parse
import urllib.request

VALID = ("green", "amber", "red")


def state_url(api, user_id):
    return f"{api.rstrip('/')}/state?" + urllib.parse.urlencode({"user_id": user_id})


def fetch_led(url, timeout_s):
    """Return the colour from /state, or None if the request or response is bad."""
    try:
        with urllib.request.urlopen(url, timeout=timeout_s) as r:
            data = json.loads(r.read().decode("utf-8"))
        color = data.get("led")
        return color if color in VALID else None
    except Exception:   # URLError, HTTPError, timeout, bad JSON, not a dict...
        return None


def send_heartbeat(api, timeout_s):
    """Tell the backend the machine is alive. Best effort: True if it answered 2xx."""
    req = urllib.request.Request(f"{api.rstrip('/')}/machine/heartbeat", data=b"", method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as r:
            return 200 <= r.status < 300
    except Exception:
        return False


def run_heartbeat(api, interval_s=2.0, stop=None, timeout_s=1.5):
    stop = stop or threading.Event()
    while not stop.is_set():
        send_heartbeat(api, timeout_s)
        stop.wait(interval_s)


def run_state_loop(api, led, interval_s=2.0, stop=None, *,
                   user_id=None, timeout_s=None, max_failures=3, blink_s=1.0, heartbeat=True):
    """Keep `led` in sync with GET {api}/state until `stop` is set.

    Calls led.set() only when the colour changes, so a capture flash from the
    scan station isn't cut short every poll.
    """
    stop = stop or threading.Event()
    if user_id is None:
        user_id = int(os.getenv("HALFLIFE_USER_ID", "1"))
    if timeout_s is None:
        timeout_s = min(1.5, interval_s)
    url = state_url(api, user_id)
    if heartbeat:
        threading.Thread(target=run_heartbeat, args=(api, interval_s, stop, timeout_s),
                         daemon=True, name="heartbeat").start()

    failures = 0
    shown = None          # last colour this loop told the LED to show
    blink_on = False
    next_poll = time.monotonic()
    next_blink = next_poll

    while not stop.is_set():
        now = time.monotonic()

        if now >= next_poll:
            next_poll = now + interval_s
            color = fetch_led(url, timeout_s)
            if color:
                if failures >= max_failures:
                    print(f"[state] backend back: {color}", flush=True)
                failures = 0
                if color != shown:
                    led.set(color)
                    shown = color
            else:
                failures += 1
                if failures == max_failures:
                    print(f"[state] {url} unreachable {failures}x, blinking amber", flush=True)
                    next_blink = now

        offline = failures >= max_failures
        if offline and time.monotonic() >= next_blink:
            blink_on = not blink_on
            shown = "amber" if blink_on else "off"
            led.set(shown)
            next_blink = time.monotonic() + blink_s

        wake = min(next_poll, next_blink) if offline else next_poll
        stop.wait(max(0.0, wake - time.monotonic()))


if __name__ == "__main__":
    from led import Led

    api = sys.argv[1] if len(sys.argv) > 1 else os.getenv("HALFLIFE_API", "http://localhost:8000")
    led = Led()
    stop = threading.Event()
    print(f"[state] polling {state_url(api, os.getenv('HALFLIFE_USER_ID', '1'))}", flush=True)
    try:
        run_state_loop(api, led, stop=stop)
    except KeyboardInterrupt:
        stop.set()
    finally:
        led.set("off")
        led.close()

"""H1 · LED driver for the desk device (§8.2).

Two wirings, picked with the LED_MODE env var:

  sockets (default)  Three Grove LED Socket modules, one per colour
                     (red, amber/yellow, green). Driving a module's SIG pin
                     HIGH lights it. Each module has its own resistor and a
                     brightness pot, so no extra parts are needed.

  rgb                One common-cathode RGB LED on three pins, each through a
                     220-330 ohm resistor (the original §8.2 plan). Amber is
                     red plus a little green, using PWM where the pin has it.

Pins are physical header numbers (GPIO.BOARD), overridable by env:
  sockets: LED_PIN_RED, LED_PIN_AMBER, LED_PIN_GREEN   (defaults 29, 31, 33)
  rgb:     LED_PIN_R,   LED_PIN_G,     LED_PIN_B       (defaults 29, 33, 31)

If Jetson.GPIO can't be imported (e.g. on a laptop), the LED is mocked and
colour changes are printed to the console instead.

    python led.py cycle    # green -> amber -> red -> white flash, loop; Ctrl-C stops
    python led.py red      # hold one colour (handy for checking wiring)
"""
import os, sys, threading, time

MODE = os.getenv("LED_MODE", "sockets").lower()

if MODE == "rgb":
    DEFAULT_PINS = {"r": 29, "g": 33, "b": 31}
    COLORS = {                      # channel -> duty cycle 0-100
        "red":   {"r": 100},
        "amber": {"r": 100, "g": 35},   # tune g until it looks amber
        "green": {"g": 100},
        "white": {"r": 100, "g": 100, "b": 100},
        "off":   {},
    }
else:                               # sockets: one Grove module per colour
    DEFAULT_PINS = {"red": 29, "amber": 31, "green": 33}
    COLORS = {
        "red":   {"red": 100},
        "amber": {"amber": 100},
        "green": {"green": 100},
        "white": {"red": 100, "amber": 100, "green": 100},  # "all on" = capture flash
        "off":   {},
    }

PINS = {ch: int(os.getenv(f"LED_PIN_{ch.upper()}", d)) for ch, d in DEFAULT_PINS.items()}

try:
    import Jetson.GPIO as GPIO
except Exception:   # laptop: ImportError, or RuntimeError from board detection
    GPIO = None


class Led:
    def __init__(self):
        self._lock = threading.Lock()
        self._base = "off"     # decision colour to return to after a flash
        self._shown = None     # what is lit right now
        self._flash_id = 0     # only the latest flash may restore the base colour
        self._pwm = {}
        if GPIO:
            GPIO.setwarnings(False)
            GPIO.setmode(GPIO.BOARD)
            for ch, pin in PINS.items():
                GPIO.setup(pin, GPIO.OUT, initial=GPIO.LOW)
                # PWM only matters for mixing amber on an RGB LED. Sockets are on/off.
                if MODE == "rgb" and os.getenv("LED_PWM", "1") != "0":
                    try:
                        p = GPIO.PWM(pin, 500); p.start(0); self._pwm[ch] = p
                    except Exception:
                        pass       # not a PWM pin: plain on/off
        self._apply("off")

    @staticmethod
    def _check(color):
        if color not in COLORS:
            raise ValueError(f"unknown colour {color!r}; use one of {list(COLORS)}")

    def _apply(self, color):
        if color == self._shown:
            return
        self._shown = color
        if not GPIO:
            print(f"[LED] {color}", flush=True)
            return
        duties = COLORS[color]
        for ch, pin in PINS.items():
            duty = duties.get(ch, 0)
            if ch in self._pwm:
                self._pwm[ch].ChangeDutyCycle(duty)
            else:
                GPIO.output(pin, GPIO.HIGH if duty else GPIO.LOW)

    def set(self, color):
        """Show the decision colour: green, amber, red, white or off."""
        self._check(color)         # reject typos before touching state
        with self._lock:
            self._base = color
            self._flash_id += 1    # a new decision cancels any pending flash restore
            self._apply(color)

    def flash(self, color="white", ms=300):
        """Briefly show `color`, then go back to the decision colour. Doesn't block."""
        self._check(color)
        with self._lock:
            self._flash_id += 1
            my_id = self._flash_id
            self._apply(color)

        def restore():
            time.sleep(ms / 1000)
            with self._lock:
                if self._flash_id == my_id:
                    self._apply(self._base)

        threading.Thread(target=restore, daemon=True).start()

    def close(self):
        if GPIO:
            for p in self._pwm.values():
                p.stop()
            GPIO.cleanup(list(PINS.values()))


if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else ""
    if arg != "cycle" and arg not in COLORS:
        sys.exit(f"usage: python led.py cycle | {' | '.join(COLORS)}")
    led = Led()
    print(f"mode={MODE} pins={PINS} gpio={'real' if GPIO else 'mock'}", flush=True)
    try:
        if arg == "cycle":
            while True:
                for c in ("green", "amber", "red"):
                    led.set(c); time.sleep(1)
                led.flash(); time.sleep(1)
        else:
            led.set(arg)
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        led.close()

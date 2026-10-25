# decaffeinate
Sip Smart — Sleep Smart

## Accounts and private history

Open http://localhost:3000/login and choose **Create an account**. Registration asks for an email,
a password of at least 12 characters, a name and basic caffeine-profile settings. Sign in on another
device with the same account to access the same records. Use **Sign out** at the bottom of the app
before another person signs in on a shared computer.

All personal API routes require an opaque HttpOnly, SameSite=Strict session cookie. Send requests
with credentials included and the signed-in profile's ID; another profile's ID is rejected with 403.
Sessions expire after seven days and logout revokes them on the server. Passwords use salted
PBKDF2-SHA256 (600,000 iterations); only hashes of session tokens are stored. Login and registration
are rate limited per server process/IP. `/auth/register`, `/auth/login`, `/auth/me`, and `/auth/logout`
manage accounts; the old anonymous `/users` creation and shared demo seeding are unavailable through
the authenticated app.

With `REPO=tiger`, accounts and sessions persist in Tiger Data alongside profile records. Auth tables
are created idempotently on first use or through `scripts/db_setup.py`. With `REPO=memory`, accounts
and logs last only until the backend restarts. Existing anonymous profiles and records are preserved
but are not automatically assigned to new accounts; migrate them administratively after confirming ownership.
This release has no email verification or password-reset email flow.

For deployment, serve both apps over HTTPS on the same site, set `COOKIE_SECURE=1`, and set
`FRONTEND_ORIGINS` to the exact frontend origin(s), comma separated. The default origins and insecure
cookie setting support local development only. Configure a trusted `HALFLIFE_API` for the internal
spoken-brief call, which forwards the session cookie. Keep `NEXT_PUBLIC_MOCK=0` for real account data.

## Run the backend

Python 3.11+ is recommended. From the repository root on Windows:

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python -m uvicorn app.main:app --app-dir backend --port 8000
```

Copy the example only when you do not already have a local .env. Keep credentials in that ignored file. API documentation is available at http://localhost:8000/docs.

Set REPO=memory for offline storage, or REPO=tiger and DATABASE_URL for Tiger Data. Apply the database schema with:

```powershell
.\.venv\Scripts\python scripts/db_setup.py
```

HALFLIFE_TIMEZONE defaults to Europe/London. Request timestamps must include UTC offsets. Onboarding user IDs start at 4; IDs 2 and 3 are reserved for demo users.

## Routes and model dependencies

The API includes state, what-if, profile, drink recognition, logging, onboarding/settings, demo seeding, heart-rate checks and spoken briefs. Health, logging, settings and recognition run independently of the model tickets.

State/profile/what-if require M1–M7. POST /demo/seed requires M1 and M8. Until those modules are installed, the affected endpoints return 503 instead of inventing model predictions. Route tests override the engine and simulator as specified by the ticket board.

GET /profile aggregates posterior bins into at most 60 chart points while preserving probability mass.

## Demo SQL

data/seed_demo.sql is a standalone, deterministic reference export: seed 42, 21 days, matching drink schedules/noise, beta 6, and true half-lives 3 and 8 hours. Apply db/schema.sql first. The SQL updates only demo IDs 2/3, rejects existing real users at those IDs, and refreshes historical daily totals.

Once M1/M8 land, regenerate the export from the real simulator, from the repository root:

```powershell
$env:PYTHONPATH="backend"
.\.venv\Scripts\python -m app.routes.demo --export data/seed_demo.sql
```

## Presage camera check (S2)

Requirements: Node.js 20+ and a Presage API key. Install both the web app and the native SDK adapter:

```powershell
cd frontend
npm install
npm run dev
```

In another terminal, from the repository root:

```powershell
cd presage
npm install
```

Add PRESAGE_API_KEY to the root .env. If Node is not on PATH, set PRESAGE_NODE to the absolute node executable path. NEXT_PUBLIC_API_URL in frontend/.env.local defaults to http://localhost:8000.

Sign in, then open http://localhost:3000/hr. Scans use the signed-in account. The page suggests a scan about 45 minutes after a recent drink, requests the camera only after Start, records five settling seconds plus a 30-second scan, and displays the saved reading.

The browser sends the recording to POST /hr/scan on your Halflife server. The server decodes MP4/WebM with the FFmpeg binary bundled by imageio-ffmpeg and feeds RGB frames into SmartSpectra's custom-input API. This avoids a Windows SDK file-reader failure. Frames are paced at 30 fps, and final accumulated metrics are drained before shutdown. Only stable pulse and breathing measurements with nonzero confidence are saved. The temporary video is deleted on success or error. Cancel releases the browser camera. POST /hr also accepts a reading produced by another Presage client. These readings do not alter the caffeine model.

Scan errors distinguish video-decoding, authentication, credits, networking, framing, lighting and missing-rate failures. The last failed scan's safe status codes and sample counts are saved in ignored work/presage-last-scan.json; no video, raw SDK error text, API key or measured vital values are stored in that diagnostic file.

Camera access requires HTTPS or localhost. The SDK is native Node.js; it is not bundled into the browser and its API key stays on the server. One SDK scan runs at a time. A real camera scan is required for live acceptance; mocked readings are used only in automated tests.

Official custom-input reference: https://smartspectra.presagetech.com/docs/nodejs/api-reference

## ElevenLabs morning brief (S3)

Add ELEVENLABS_API_KEY to the root .env. Optionally set ELEVENLABS_VOICE_ID and ELEVENLABS_MODEL. The defaults are the George voice and eleven_multilingual_v2. Set HALFLIFE_API to the backend URL if it differs from http://127.0.0.1:8000.

GET /brief?user_id=1 fetches /state over HTTP and returns audio/mpeg. Audio is cached separately by user, local date, voice/model and advice, so updated advice invalidates the cache. The default cache is work/brief_cache. Set BRIEF_CACHE_DIR to use another location.

The real state route must be available (M1–M7) for a personal brief. Missing credentials return 503; upstream timeouts return 504; failed generations are not cached.

```powershell
curl.exe "http://localhost:8000/brief?user_id=1" --fail --output morning.mp3
```

API reference: https://elevenlabs.io/docs/api-reference/text-to-speech/convert

## Tests

```powershell
.\.venv\Scripts\python -m pytest -q
```

Database tests read DATABASE_URL from the environment or root .env, run in temporary schemas, and skip when no database is configured. Vendor API calls and the model are mocked in route tests. Live Gemini, Presage and ElevenLabs checks are separate from this suite.

# T00 · Scaffold & freeze contracts

> Set up the empty project and the shared contracts so all four people can build in parallel from the start.

**Must · All (one person types, everyone reviews) · 45m**
- Create the layout in 0.1, with every file containing the signatures from 0.2 to 0.6 and bodies of `raise NotImplementedError` (Python) or a `TODO` div (React).
- `main.py`: create the FastAPI app, enable CORS for `*`, and auto-include every `router` found in `app/routes/*.py`. Add `GET /health`.
- `deps.py`: `get_repo()` chooses the repo from `REPO` (import inside the function so a missing implementation doesn't break startup). Add `get_engine()` and `get_now()` (overridable in tests).
- Next.js app with Tailwind and Recharts installed. Pages compose the stubs.
- Add `requirements.txt` (fastapi, uvicorn, numpy, scipy, pydantic, psycopg[binary], google-genai, python-multipart, pytest), `.env.example` and a root `Makefile` (`make api`, `make web`, `make test`).
- **Done when:** `make api` and `make web` both start, `/health` returns 200, every page renders its TODO stubs, and the contracts are committed to `main`.

## References

- Shared contracts: [00-CONTRACTS.md](00-CONTRACTS.md) (frozen; built in T00)
- Spec: [halflife-whitepaper.md](../halflife-whitepaper.md) (§ numbers above)
- Rules: own only the files listed above; build against fakes, not other tickets' code.

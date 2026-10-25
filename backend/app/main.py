"""Run: python -m uvicorn app.main:app --app-dir backend --port 8000."""
from importlib import import_module
from pathlib import Path
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.auth import allowed_origins, protect

app = FastAPI(title="Halflife", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=allowed_origins(), allow_credentials=True,
                   allow_methods=["GET", "POST", "PATCH", "DELETE"], allow_headers=["Content-Type"])

@app.middleware("http")
async def private_responses(request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    return response

@app.exception_handler(ModuleNotFoundError)
async def missing_model(request: Request, error: ModuleNotFoundError):
    if error.name and error.name.startswith("app.model"):
        return JSONResponse(status_code=503, content={"detail": "Required model tickets are not installed yet"})
    raise error

@app.get("/health")
def health():
    return {"status": "ok"}

for path in sorted((Path(__file__).parent / "routes").glob("*.py")):
    if not path.name.startswith("_"):
        module = import_module(f"app.routes.{path.stem}")
        if hasattr(module, "router"):
            # Machine presence contains no personal records; the device heartbeat
            # must remain available before a browser user signs in.
            public = path.stem in {"auth", "machine"}
            app.include_router(module.router, dependencies=[] if public else [Depends(protect)])

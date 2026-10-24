"""Run: python -m uvicorn app.main:app --app-dir backend --port 8000."""
from importlib import import_module
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="Halflife", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

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
            app.include_router(module.router)

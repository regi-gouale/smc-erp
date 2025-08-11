import os
import logging
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.api.v1.persons import router as persons_router


def _get_bool(env_name: str, default: bool = False) -> bool:
    val = os.getenv(env_name)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "y", "on"}


def _get_cors_origins() -> List[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    if not raw:
        return ["*"]
    return [o.strip() for o in raw.split(",") if o.strip()]


def _configure_logging() -> None:
    level = os.getenv("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
    logging.getLogger("uvicorn.access").setLevel(
        os.getenv("ACCESS_LOG_LEVEL", "WARNING").upper()
    )


ENV = os.getenv("ENV", "dev").lower()
DISABLE_DOCS = _get_bool("DISABLE_DOCS", default=(ENV == "prod"))

DOCS_URL = None if DISABLE_DOCS else "/docs"
REDOC_URL = None if DISABLE_DOCS else "/redoc"
OPENAPI_URL = None if DISABLE_DOCS else "/openapi.json"


@asynccontextmanager
async def lifespan(app: FastAPI):
    _configure_logging()
    logging.info("Application startup")
    # Initialize DB connections and create tables
    from app.core.db import init_db

    await init_db()
    logging.info("Database initialized")
    try:
        yield
    finally:
        # TODO: gracefully close resources here
        logging.info("Application shutdown")


app = FastAPI(
    title=os.getenv("APP_NAME", "SMC ERP API"),
    version=os.getenv("APP_VERSION", "0.1.0"),
    docs_url=DOCS_URL,
    redoc_url=REDOC_URL,
    openapi_url=OPENAPI_URL,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["meta"])
async def root():
    return {"status": "ok", "app": app.title, "version": app.version}


@app.get("/healthz", tags=["meta"])
async def healthz():
    return {"status": "healthy"}


@app.get("/readyz", tags=["meta"])
async def readyz():
    # TODO: add checks (DB ping, cache ping, etc.)
    return {"status": "ready"}


# TODO: include your routers here
app.include_router(persons_router, prefix="/api/v1/persons", tags=["persons"])


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = _get_bool("RELOAD", default=(ENV != "prod"))
    uvicorn.run("main:app", host=host, port=port, reload=reload)

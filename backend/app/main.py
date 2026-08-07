import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from .database import Base, engine, SessionLocal
from .utils.cleanup import delete_expired_tasks
from .routers import admin as admin_router
from .routers import auth as auth_router
from .routers import tasks as tasks_router
from .routers import websocket as websocket_router
from .routers import push as push_router
from sqlalchemy import text


# For production, prefer Alembic migrations over create_all().
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Employee Task Management System",
    version="1.0.0",
    description="JWT-secured task management API with real-time WebSocket notifications.",
)


async def _periodic_cleanup():
    """Runs forever in the background, deleting tasks older than 24h
    even if nobody happens to load a page right when they expire."""
    while True:
        db = SessionLocal()
        try:
            delete_expired_tasks(db)
        finally:
            db.close()
        await asyncio.sleep(300)  # every 5 minutes


MIGRATION_SQL = """
DO $$ BEGIN
    CREATE TYPE departmentenum AS ENUM ('I_LAB', 'IPHOTO_BOOK', 'I_LAB_STD', 'DD_ENGINEERING', 'OTHERS');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS department departmentenum NOT NULL DEFAULT 'OTHERS';
"""


@app.on_event("startup")
async def on_startup():
    if engine.dialect.name == "postgresql":
        with engine.begin() as conn:
            conn.execute(text(MIGRATION_SQL))
        print("Migrations applied.")
    asyncio.create_task(_periodic_cleanup())


# Comma-separated list of allowed origins, e.g.:
#   CORS_ORIGINS=https://your-frontend.up.railway.app,https://yourapp.com
_cors_origins = os.getenv("CORS_ORIGINS", "")
allow_origins = [o.strip() for o in _cors_origins.split(",") if o.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(tasks_router.router)
app.include_router(admin_router.router)
app.include_router(websocket_router.router)
app.include_router(push_router.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok"}
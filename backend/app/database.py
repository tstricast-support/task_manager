import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Loads variables from a local .env file (JWT_SECRET_KEY, DATABASE_URL, etc.)
# In production (Railway), real env vars are already set, so this is a no-op.
load_dotenv()

# Defaults to a local SQLite file for zero-config local dev.
# For production, set DATABASE_URL to a PostgreSQL DSN, e.g.:
#   postgresql://user:password@localhost:5432/taskdb
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./task_manager.db")

# Railway (and several other managed Postgres providers) hand out DSNs that
# start with "postgres://", but SQLAlchemy 2.x + psycopg2 require
# "postgresql://". Normalize it so the same env var works either way.
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgres://", "postgresql://", 1
    )

# check_same_thread is only needed for SQLite (FastAPI uses multiple threads).
connect_args = (
    {"check_same_thread": False}
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

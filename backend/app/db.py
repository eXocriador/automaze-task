import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import Engine
from sqlalchemy import text

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DEFAULT_SQLITE_PATH = BASE_DIR / "app.db"

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}"
)

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith(
    "sqlite"
) else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_sqlite_columns(engine: Engine) -> None:
    """Simple migration helper to add new columns if they are missing (SQLite only)."""
    if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        return

    with engine.connect() as conn:
        columns = {
            row["name"]
            for row in conn.execute(text("PRAGMA table_info('tasks')")).mappings().all()
        }
        to_add = []
        if "category" not in columns:
            to_add.append("ALTER TABLE tasks ADD COLUMN category VARCHAR(100)")
        if "due_date" not in columns:
            to_add.append("ALTER TABLE tasks ADD COLUMN due_date DATETIME")
        if "order_index" not in columns:
            to_add.append("ALTER TABLE tasks ADD COLUMN order_index INTEGER")

        for ddl in to_add:
            conn.execute(text(ddl))
        if to_add:
            conn.commit()

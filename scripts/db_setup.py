r"""Apply the Tiger Data schema using Python (works on Windows without psql).

Run from the repository root: .venv\Scripts\python scripts/db_setup.py
DATABASE_URL may be set in the environment or in the ignored root .env.
"""
import os
from pathlib import Path
import sys

from dotenv import dotenv_values
import psycopg


def main():
    root = Path(__file__).resolve().parents[1]
    url = os.environ.get("DATABASE_URL") or dotenv_values(root / ".env").get("DATABASE_URL")
    if not url:
        print("Set DATABASE_URL in the environment or the root .env file.", file=sys.stderr)
        return 1
    schema = (root / "backend/app/db/schema.sql").read_text(encoding="utf-8")
    try:
        with psycopg.connect(url, autocommit=True, connect_timeout=10) as conn:
            conn.execute(schema, prepare=False)
    except psycopg.Error as error:
        # Connection exceptions may contain credentials; print only the type
        # and SQLSTATE. Keep the connection string out of terminal output.
        print(f"Database setup failed: {type(error).__name__} "
              f"(SQLSTATE {error.sqlstate or 'unavailable'}).", file=sys.stderr)
        return 1
    print("Tiger Data schema applied successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

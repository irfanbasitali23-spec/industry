from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import engine


def migrate_database():
    """Add new columns to existing databases without Alembic."""
    statements = [
        "ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS time_in VARCHAR(20)",
        "ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS time_out VARCHAR(20)",
        "ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS footer_options JSON DEFAULT '{}'",
    ]
    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))

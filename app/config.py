import os
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

LOCAL_DATABASE_URL = (
    "postgresql://inspection_user:inspection_pass@localhost:5432/machine_inspection"
)

CLOUD_ENV_MARKERS = (
    "VERCEL",
    "RENDER",
    "RAILWAY_ENVIRONMENT",
    "FLY_APP_NAME",
    "HEROKU_APP_NAME",
    "AWS_LAMBDA_FUNCTION_NAME",
)

# Explicit DATABASE_URL wins (Docker Compose sets this for local db)
DATABASE_URL_ENV_KEYS = (
    "DATABASE_URL",
    "DATABASE_URL_UNPOOLED",
    "POSTGRES_URL_NON_POOLING",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
)


def _is_cloud_host() -> bool:
    return any(os.getenv(key) for key in CLOUD_ENV_MARKERS)


def _clean_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    parsed = urlparse(url)
    params = parse_qs(parsed.query, keep_blank_values=True)
    # psycopg2 can fail with channel_binding on some platforms
    params.pop("channel_binding", None)
    if "sslmode" not in params and _is_cloud_host():
        params["sslmode"] = ["require"]

    flat = {k: v[0] if isinstance(v, list) else v for k, v in params.items()}
    query = urlencode(flat)
    return urlunparse(parsed._replace(query=query))


def resolve_database_url_from_env() -> str | None:
    """Read Neon / Vercel Postgres env vars (integration sets these automatically)."""
    for key in DATABASE_URL_ENV_KEYS:
        value = os.environ.get(key)
        if value:
            return _clean_database_url(value)

    user = os.environ.get("PGUSER") or os.environ.get("POSTGRES_USER")
    password = os.environ.get("PGPASSWORD") or os.environ.get("POSTGRES_PASSWORD")
    host = (
        os.environ.get("PGHOST_UNPOOLED")
        or os.environ.get("POSTGRES_HOST")
        or os.environ.get("PGHOST")
    )
    database = os.environ.get("PGDATABASE") or os.environ.get("POSTGRES_DATABASE")
    if user and password and host and database:
        return _clean_database_url(
            f"postgresql://{user}:{password}@{host}/{database}?sslmode=require"
        )
    return None


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str | None = None
    secret_key: str = "change-this-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    admin_email: str = "admin@example.com"
    admin_password: str = "admin123"
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost"

    @model_validator(mode="before")
    @classmethod
    def load_database_url_from_env(cls, data):
        if not isinstance(data, dict):
            data = {}
        resolved = resolve_database_url_from_env()
        if resolved:
            data["database_url"] = resolved
        return data

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str | None) -> str | None:
        if v:
            return _clean_database_url(v)
        return v

    @model_validator(mode="after")
    def resolve_database_url(self):
        url = self.database_url

        if not url:
            if _is_cloud_host():
                raise ValueError(
                    "No PostgreSQL connection string found.\n\n"
                    "Vercel + Neon:\n"
                    "  1. Vercel Dashboard → Storage → Neon → Connect to Project\n"
                    "  2. This adds POSTGRES_URL automatically — redeploy after connecting\n\n"
                    "Or set manually: DATABASE_URL or POSTGRES_URL_NON_POOLING"
                )
            url = LOCAL_DATABASE_URL

        if _is_cloud_host() and ("localhost" in url or "127.0.0.1" in url):
            raise ValueError(
                "Database URL points to localhost in the cloud.\n"
                "Connect Neon to your Vercel project (Storage tab)."
            )

        object.__setattr__(self, "database_url", url)
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [o.strip() for o in self.cors_origins.split(",") if o.strip()]
        vercel_url = os.getenv("VERCEL_URL")
        if vercel_url:
            origins.append(f"https://{vercel_url}")
        preview = os.getenv("VERCEL_BRANCH_URL")
        if preview:
            origins.append(f"https://{preview}")
        return list(dict.fromkeys(origins))

    @property
    def is_production(self) -> bool:
        return _is_cloud_host()


try:
    settings = Settings()
except ValueError as exc:
    raise SystemExit(f"\n[CONFIG ERROR] {exc}\n") from exc

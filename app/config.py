import os

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


def _is_cloud_host() -> bool:
    return any(os.getenv(key) for key in CLOUD_ENV_MARKERS)


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
        # Always prefer raw os.environ (Render/Vercel inject here)
        env_url = os.environ.get("DATABASE_URL")
        if env_url:
            data["database_url"] = env_url
        return data

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str | None) -> str | None:
        if v and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    @model_validator(mode="after")
    def resolve_database_url(self):
        url = self.database_url

        if not url:
            if _is_cloud_host():
                raise ValueError(
                    "DATABASE_URL is missing. This app cannot use localhost in the cloud.\n\n"
                    "Fix:\n"
                    "  1. Create a free PostgreSQL database at https://neon.tech\n"
                    "  2. Copy the connection string\n"
                    "  3. In Render (or your API host) → Environment → add:\n"
                    "     DATABASE_URL=postgresql://user:pass@host/db?sslmode=require\n"
                    "  4. Redeploy the API service\n\n"
                    "Deploy frontend on Vercel + API on Render + DB on Neon (see README.md)."
                )
            url = LOCAL_DATABASE_URL

        if _is_cloud_host() and ("localhost" in url or "127.0.0.1" in url):
            raise ValueError(
                "DATABASE_URL points to localhost but you are running in the cloud.\n"
                "Replace it with your Neon/Supabase PostgreSQL connection string."
            )

        object.__setattr__(self, "database_url", url)
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return _is_cloud_host()


try:
    settings = Settings()
except ValueError as exc:
    raise SystemExit(f"\n[CONFIG ERROR] {exc}\n") from exc

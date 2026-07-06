import os

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://inspection_user:inspection_pass@localhost:5432/machine_inspection"
    secret_key: str = "change-this-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    admin_email: str = "admin@example.com"
    admin_password: str = "admin123"
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost"

    @field_validator("database_url", mode="before")
    @classmethod
    def fix_database_url(cls, v: str) -> str:
        if v and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return bool(os.getenv("VERCEL") or os.getenv("RENDER") or os.getenv("RAILWAY_ENVIRONMENT"))

    class Config:
        env_file = ".env"


settings = Settings()

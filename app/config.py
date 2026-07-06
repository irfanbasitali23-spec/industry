from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://inspection_user:inspection_pass@localhost:5432/machine_inspection"
    secret_key: str = "change-this-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    admin_email: str = "admin@example.com"
    admin_password: str = "admin123"

    class Config:
        env_file = ".env"


settings = Settings()

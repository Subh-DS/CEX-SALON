from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Blush Studio API"
    env: str = "development"
    database_url: str = "sqlite+aiosqlite:///./sundara_dev.db"
    jwt_secret: str = "change-me-in-production-min-32-chars"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    admin_email: str = ""  # set to bootstrap the first admin on startup (deploy)

    model_config = {"env_file": ".env", "extra": "ignore"}

    @field_validator("database_url", mode="before")
    @classmethod
    def _normalize_db_url(cls, v: str) -> str:
        # PaaS hosts (Render/Heroku) hand out postgres:// — SQLAlchemy wants
        # postgresql://, and our async engine wants the +asyncpg driver.
        if isinstance(v, str):
            if v.startswith("postgres://"):
                v = "postgresql+asyncpg://" + v[len("postgres://"):]
            elif v.startswith("postgresql://"):
                v = "postgresql+asyncpg://" + v[len("postgresql://"):]
        return v

    def model_post_init(self, _context) -> None:
        # Never boot a shared environment with the shipped dev secret.
        if self.env != "development" and self.jwt_secret == "change-me-in-production-min-32-chars":
            raise RuntimeError("JWT_SECRET must be set to a real value when ENV != development.")

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()

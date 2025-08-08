from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from dotenv import load_dotenv
import os

_BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(_BACKEND_DIR / ".env")
load_dotenv(_BACKEND_DIR / ".env.local")


class Settings(BaseSettings):
    ENV: str = "development"
    API_PREFIX: str = "/api/v1"

    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", 5432))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "smc_erp")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "smc")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "smc")

    CORS_ORIGINS: str = "*"  # comma-separated

    model_config = SettingsConfigDict(
        env_file=(str(_BACKEND_DIR / ".env"), str(_BACKEND_DIR / ".env.local")),
        env_prefix="SMC_",
        case_sensitive=False,
    )

    @property
    def DATABASE_URL(self) -> str:
        # Sync URL (if needed elsewhere)
        return f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        # Async URL for SQLAlchemy with asyncpg
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


settings = Settings()

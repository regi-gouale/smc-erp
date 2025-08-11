from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from dotenv import load_dotenv

_BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(_BACKEND_DIR / ".env")
load_dotenv(_BACKEND_DIR / ".env.local")


class Settings(BaseSettings):
    ENV: str = "development"
    API_PREFIX: str = "/api/v1"

    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "smc_erp"
    POSTGRES_USER: str = "smc"
    POSTGRES_PASSWORD: str = "smc"

    CORS_ORIGINS: str = "*"  # comma-separated

    model_config = SettingsConfigDict(
        env_file=(str(_BACKEND_DIR / ".env"), str(_BACKEND_DIR / ".env.local")),
        case_sensitive=False,
        env_prefix="SMC_",
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

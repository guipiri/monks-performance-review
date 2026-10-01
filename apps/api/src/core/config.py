from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Monks Performance Review API"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "super-secret-key-change-in-production-1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = (
        "postgresql+psycopg://admin:admin@localhost:5432/monks-performance-review"
    )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

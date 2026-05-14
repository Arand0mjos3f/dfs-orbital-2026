from functools import lru_cache

from pydantic import BaseModel


class Settings(BaseModel):
    """Runtime settings for the DFS API."""

    app_name: str = "Debt-First Search API"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings."""

    return Settings()

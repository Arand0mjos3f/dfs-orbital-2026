from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.schemas.health import HealthCheck

router = APIRouter()


@router.get("/health", response_model=HealthCheck)
def health_check(settings: Settings = Depends(get_settings)) -> HealthCheck:
    """Return API health status for uptime checks."""

    return HealthCheck(
        status="ok",
        service=settings.app_name,
        environment=settings.environment,
    )

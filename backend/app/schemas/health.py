from pydantic import BaseModel


class HealthCheck(BaseModel):
    """Health check response payload."""

    status: str
    service: str
    environment: str

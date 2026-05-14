from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import get_settings


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    settings = get_settings()
    application = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="Backend API for the Debt-First Search shared expense app.",
    )

    @application.get("/", tags=["root"])
    def read_root() -> dict[str, str]:
        """Return basic API metadata."""

        return {
            "message": "Welcome to the Debt-First Search API",
            "docs": "/docs",
            "health": f"{settings.api_v1_prefix}/health",
        }

    application.include_router(api_router, prefix=settings.api_v1_prefix)
    return application


app = create_app()

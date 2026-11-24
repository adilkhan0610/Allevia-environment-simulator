from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "source": settings.TELEMETRY_SOURCE,
        "tick_configured": bool(settings.TICK_TOKEN),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

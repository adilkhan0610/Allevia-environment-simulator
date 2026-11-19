from fastapi import APIRouter
from app.api.endpoints import health, scenarios, sessions, integration

api_router = APIRouter(prefix="/api/v1")

# Scenarios endpoints
api_router.include_router(scenarios.router)

# Sessions endpoints
api_router.include_router(sessions.router)

# Integration endpoints
api_router.include_router(integration.router)

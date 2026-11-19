from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.integration_service import integration_service

router = APIRouter(prefix="/integration", tags=["Integration"])


class ModeRequest(BaseModel):
    mode: str = Field(..., json_schema_extra={"example": "LIVE_BRIDGE"})
    enabled: bool = Field(True, json_schema_extra={"example": True})


@router.post("/mode")
async def set_integration_mode(payload: ModeRequest):
    integration_service.set_mode(payload.mode, payload.enabled)
    return await integration_service.check_status()


@router.get("/status")
async def get_integration_status():
    return await integration_service.check_status()

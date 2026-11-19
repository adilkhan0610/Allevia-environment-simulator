from typing import Optional, Union
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.integration_service import integration_service

router = APIRouter(prefix="/integration", tags=["Integration"])


class ModeRequest(BaseModel):
    mode: str = Field(..., json_schema_extra={"example": "LIVE_BRIDGE"})
    enabled: bool = Field(True, json_schema_extra={"example": True})


class TargetNodeRequest(BaseModel):
    node: Optional[Union[int, str]] = Field(None, description="Node number (1-5) or Node ID (N01-N05)")
    node_id: Optional[str] = Field(None, description="Explicit Node ID (N01-N05)")


@router.post("/mode")
async def set_integration_mode(payload: ModeRequest):
    integration_service.set_mode(payload.mode, payload.enabled)
    return await integration_service.check_status()


@router.post("/target-node")
async def set_target_node(payload: TargetNodeRequest):
    target = payload.node_id if payload.node_id is not None else payload.node
    if target is None:
        target = 1
    integration_service.set_target_node(target)
    return await integration_service.check_status()


@router.get("/status")
async def get_integration_status():
    return await integration_service.check_status()

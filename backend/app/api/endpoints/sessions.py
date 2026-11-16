from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status
from app.schemas.session import SessionCreateRequest, SessionResponse, SessionDeleteResponse
from app.schemas.telemetry import TelemetryPacket
from app.services.session_service import session_service

router = APIRouter(prefix="/sessions", tags=["Sessions"])


class EngineControlAction(BaseModel):
    action: str = Field(..., description="start, pause, resume, stop, reset, step, speed, scenario, fault")
    speed_multiplier: Optional[float] = None
    intensity_multiplier: Optional[float] = None
    scenario_id: Optional[str] = None
    sensor_name: Optional[str] = None
    fault_type: Optional[str] = None
    dt: Optional[float] = 1.0


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(request: SessionCreateRequest):
    session = session_service.create_session(request)
    return SessionResponse(
        session_id=session.session_id,
        device_id=session.device_id,
        created_at=session.created_at,
        expires_at=session.expires_at,
        status=session.status,
        source=session.source,
        selected_scenario=session.selected_scenario,
        speed_multiplier=session.speed_multiplier,
        intensity_multiplier=session.intensity_multiplier,
    )


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Simulation session '{session_id}' not found or expired"
        )
    return SessionResponse(
        session_id=session.session_id,
        device_id=session.device_id,
        created_at=session.created_at,
        expires_at=session.expires_at,
        status=session.status,
        source=session.source,
        selected_scenario=session.selected_scenario,
        speed_multiplier=session.speed_multiplier,
        intensity_multiplier=session.intensity_multiplier,
    )


@router.delete("/{session_id}", response_model=SessionDeleteResponse)
async def delete_session(session_id: str):
    deleted = session_service.delete_session(session_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Simulation session '{session_id}' not found"
        )
    return SessionDeleteResponse(
        session_id=session_id,
        deleted=True,
        message="Session successfully terminated and removed"
    )


@router.get("/{session_id}/engine/state")
async def get_engine_state(session_id: str):
    engine = session_service.get_engine(session_id)
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Simulation engine for session '{session_id}' not found"
        )
    return engine.get_current_state()


@router.get("/{session_id}/engine/history", response_model=List[TelemetryPacket])
async def get_engine_history(session_id: str, limit: int = 50):
    engine = session_service.get_engine(session_id)
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Simulation engine for session '{session_id}' not found"
        )
    return engine.get_recent_history(limit=limit)


@router.post("/{session_id}/engine/control")
async def control_engine(session_id: str, payload: EngineControlAction):
    engine = session_service.get_engine(session_id)
    session = session_service.get_session(session_id)
    if not engine or not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Simulation engine for session '{session_id}' not found"
        )

    act = payload.action.lower()
    if act == "start":
        engine.start()
        session.status = "RUNNING"
    elif act == "pause":
        engine.pause()
        session.status = "PAUSED"
    elif act == "resume":
        engine.resume()
        session.status = "RUNNING"
    elif act == "stop":
        engine.stop()
        session.status = "STOPPED"
    elif act == "reset":
        engine.reset()
        session.status = "IDLE"
    elif act == "step":
        packet = engine.step(dt=payload.dt or 1.0)
        return {"action": "step", "packet": packet.model_dump()}
    elif act == "speed":
        if payload.speed_multiplier is not None:
            engine.set_speed(payload.speed_multiplier)
            session.speed_multiplier = payload.speed_multiplier
    elif act == "intensity":
        if payload.intensity_multiplier is not None:
            engine.set_intensity(payload.intensity_multiplier)
            session.intensity_multiplier = payload.intensity_multiplier
    elif act == "scenario":
        if payload.scenario_id:
            engine.load_scenario(payload.scenario_id)
            session.selected_scenario = payload.scenario_id
    elif act == "fault":
        if payload.sensor_name:
            engine.set_fault(payload.sensor_name, payload.fault_type)
    elif act == "clear_faults":
        engine.clear_all_faults()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown engine action '{payload.action}'"
        )

    return {
        "action": act,
        "session_id": session_id,
        "engine_state": engine.get_current_state(),
    }

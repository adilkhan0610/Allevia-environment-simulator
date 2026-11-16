from fastapi import APIRouter, HTTPException, status
from app.schemas.session import SessionCreateRequest, SessionResponse, SessionDeleteResponse
from app.services.session_service import session_service

router = APIRouter(prefix="/sessions", tags=["Sessions"])


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

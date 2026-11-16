import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, List
from app.models.session import SimulationSessionModel
from app.schemas.session import SessionCreateRequest
from app.core.config import settings


class SessionService:
    def __init__(self):
        self._sessions: Dict[str, SimulationSessionModel] = {}

    def create_session(self, request: SessionCreateRequest) -> SimulationSessionModel:
        now = datetime.now(timezone.utc)
        expires = now + timedelta(minutes=settings.SESSION_TTL_MINUTES)
        session_id = str(uuid.uuid4())
        device_id = request.device_id or f"ALLEVIA-SIM-{uuid.uuid4().hex[:4].upper()}"

        session = SimulationSessionModel(
            session_id=session_id,
            device_id=device_id,
            created_at=now,
            expires_at=expires,
            status="IDLE",
            source=settings.TELEMETRY_SOURCE,
            selected_scenario=request.scenario_id or "scenario-01",
            speed_multiplier=request.speed_multiplier,
            intensity_multiplier=request.intensity_multiplier,
            sim_time_sec=0.0,
            sequence_counter=0,
        )
        self._sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[SimulationSessionModel]:
        session = self._sessions.get(session_id)
        if session:
            # Check expiration
            if datetime.now(timezone.utc) > session.expires_at:
                self.delete_session(session_id)
                return None
        return session

    def delete_session(self, session_id: str) -> bool:
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False

    def list_sessions(self) -> List[SimulationSessionModel]:
        return list(self._sessions.values())


session_service = SessionService()

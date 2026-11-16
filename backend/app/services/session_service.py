import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, List
from app.models.session import SimulationSessionModel
from app.schemas.session import SessionCreateRequest
from app.core.config import settings
from app.simulator.engine import LocalSimulationEngine


class SessionService:
    def __init__(self):
        self._sessions: Dict[str, SimulationSessionModel] = {}
        self._engines: Dict[str, LocalSimulationEngine] = {}

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

        # Instantiate simulation engine for session
        engine = LocalSimulationEngine(
            session_id=session_id,
            device_id=device_id,
            scenario_id=request.scenario_id or "scenario-01",
            speed_multiplier=request.speed_multiplier,
            intensity_multiplier=request.intensity_multiplier,
        )
        self._engines[session_id] = engine

        return session

    def get_session(self, session_id: str) -> Optional[SimulationSessionModel]:
        session = self._sessions.get(session_id)
        if session:
            # Check expiration
            if datetime.now(timezone.utc) > session.expires_at:
                self.delete_session(session_id)
                return None
        return session

    def get_engine(self, session_id: str) -> Optional[LocalSimulationEngine]:
        self.get_session(session_id)  # triggers expiration cleanup if needed
        return self._engines.get(session_id)

    def delete_session(self, session_id: str) -> bool:
        deleted = False
        if session_id in self._sessions:
            del self._sessions[session_id]
            deleted = True
        if session_id in self._engines:
            del self._engines[session_id]
        return deleted

    def list_sessions(self) -> List[SimulationSessionModel]:
        return list(self._sessions.values())


session_service = SessionService()

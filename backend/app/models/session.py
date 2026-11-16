from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.session import SimulationStatus


class SimulationSessionModel(BaseModel):
    session_id: str
    device_id: str
    created_at: datetime
    expires_at: datetime
    status: SimulationStatus = "IDLE"
    source: str = "simulated"
    selected_scenario: str = "scenario-01"
    speed_multiplier: float = 1.0
    intensity_multiplier: float = 1.0
    sim_time_sec: float = 0.0
    sequence_counter: int = 0

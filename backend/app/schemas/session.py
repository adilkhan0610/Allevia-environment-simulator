from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


SimulationStatus = Literal["IDLE", "RUNNING", "PAUSED", "TERMINATED"]


class SessionCreateRequest(BaseModel):
    scenario_id: Optional[str] = Field("scenario-01", description="Initial scenario ID to bind")
    device_id: Optional[str] = Field(None, description="Optional custom simulated device identifier")
    speed_multiplier: float = Field(1.0, ge=0.25, le=5.0, description="Simulation speed factor")
    intensity_multiplier: float = Field(1.0, ge=0.5, le=2.0, description="Environmental intensity factor")


class SessionResponse(BaseModel):
    session_id: str
    device_id: str
    created_at: datetime
    expires_at: datetime
    status: SimulationStatus
    source: str = Field("simulated", description="Data isolation marker")
    selected_scenario: str
    speed_multiplier: float
    intensity_multiplier: float


class SessionDeleteResponse(BaseModel):
    session_id: str
    deleted: bool
    message: str

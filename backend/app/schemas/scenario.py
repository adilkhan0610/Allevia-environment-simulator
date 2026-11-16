from typing import List, Optional
from pydantic import BaseModel, Field


class ScenarioMetadata(BaseModel):
    id: str = Field(..., description="Unique scenario identifier")
    slug: str = Field(..., description="URL-friendly slug")
    name: str = Field(..., description="Display name of the scenario")
    category: str = Field(..., description="Scenario categorization")
    description: str = Field(..., description="Detailed description")
    duration_seconds: int = Field(300, description="Duration in seconds")
    primary_threat: str = Field(..., description="Key hazard represented")
    target_sensors: List[str] = Field(default_factory=list, description="Sensors primarily affected")
    risk_level_expected: str = Field(..., description="Expected threat level")
    expected_tier: Optional[str] = Field("GREEN", description="Expected tier result")


class ScenarioListResponse(BaseModel):
    total: int
    scenarios: List[ScenarioMetadata]

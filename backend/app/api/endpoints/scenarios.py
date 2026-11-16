from fastapi import APIRouter
from app.schemas.scenario import ScenarioListResponse
from app.services.scenario_service import scenario_service

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])


@router.get("", response_model=ScenarioListResponse)
async def list_scenarios():
    scenarios = scenario_service.get_all_scenarios()
    return ScenarioListResponse(total=len(scenarios), scenarios=scenarios)

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_list_scenarios():
    response = client.get("/api/v1/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "scenarios" in data
    assert data["total"] == 6
    scenario_slugs = [s["slug"] for s in data["scenarios"]]
    assert "normal-day" in scenario_slugs
    assert "midday-heatwave" in scenario_slugs
    assert "humid-heat" in scenario_slugs
    assert "smoke-dust-episode" in scenario_slugs
    assert "gas-leak" in scenario_slugs
    assert "sensor-fault" in scenario_slugs

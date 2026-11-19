import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from main import app
from app.services.integration_service import integration_service


def test_integration_endpoints():
    client = TestClient(app)

    # 1. Test set mode
    resp = client.post(
        "/api/v1/integration/mode",
        json={"mode": "LIVE_BRIDGE", "enabled": True},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["mode"] == "LIVE_BRIDGE"
    assert data["enabled"] is True
    assert data["node_id"] == "N03"
    assert data["zone_id"] == "B"

    # 2. Test status endpoint
    resp2 = client.get("/api/v1/integration/status")
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["mode"] == "LIVE_BRIDGE"
    assert "total_sent" in data2
    assert "total_stored" in data2

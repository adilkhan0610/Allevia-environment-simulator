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
    assert "node_id" in data
    assert "zone_id" in data

    # 2. Test target node switching
    resp_node = client.post(
        "/api/v1/integration/target-node",
        json={"node": 3},
    )
    assert resp_node.status_code == 200
    data_node = resp_node.json()
    assert data_node["selected_node"] == 3
    assert data_node["node_id"] == "N03"
    assert data_node["zone_id"] == "C"

    # Switch to Node 1
    resp_node1 = client.post(
        "/api/v1/integration/target-node",
        json={"node": 1},
    )
    assert resp_node1.status_code == 200
    data_node1 = resp_node1.json()
    assert data_node1["selected_node"] == 1
    assert data_node1["node_id"] == "N01"
    assert data_node1["zone_id"] == "A"

    # 3. Test status endpoint
    resp2 = client.get("/api/v1/integration/status")
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["mode"] == "LIVE_BRIDGE"
    assert "total_sent" in data2
    assert "total_stored" in data2
    assert "available_nodes" in data2

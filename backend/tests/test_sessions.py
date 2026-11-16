import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_and_get_and_delete_session():
    # 1. Create Session
    create_payload = {
        "scenario_id": "scenario-01",
        "speed_multiplier": 1.5,
        "intensity_multiplier": 1.2
    }
    create_res = client.post("/api/v1/sessions", json=create_payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert "session_id" in created_data
    session_id = created_data["session_id"]
    assert created_data["source"] == "simulated"
    assert created_data["status"] == "IDLE"
    assert created_data["speed_multiplier"] == 1.5
    assert created_data["intensity_multiplier"] == 1.2

    # 2. Get Session
    get_res = client.get(f"/api/v1/sessions/{session_id}")
    assert get_res.status_code == 200
    retrieved_data = get_res.json()
    assert retrieved_data["session_id"] == session_id
    assert retrieved_data["selected_scenario"] == "scenario-01"

    # Test engine state endpoint
    state_resp = client.get(f"/api/v1/sessions/{session_id}/engine/state")
    assert state_resp.status_code == 200
    state_data = state_resp.json()
    assert state_data["session_id"] == session_id
    assert state_data["scenario_id"] == "scenario-01"

    # Test engine control: step
    ctrl_resp = client.post(
        f"/api/v1/sessions/{session_id}/engine/control",
        json={"action": "step", "dt": 1.0}
    )
    assert ctrl_resp.status_code == 200
    assert ctrl_resp.json()["packet"]["source"] == "simulated"

    # Test engine history
    hist_resp = client.get(f"/api/v1/sessions/{session_id}/engine/history")
    assert hist_resp.status_code == 200
    assert len(hist_resp.json()) == 1

    # 3. Delete Session
    del_res = client.delete(f"/api/v1/sessions/{session_id}")
    assert del_res.status_code == 200
    assert del_res.json()["deleted"] is True

    # 4. Verify Not Found after Delete
    get_after_del = client.get(f"/api/v1/sessions/{session_id}")
    assert get_after_del.status_code == 404


def test_get_nonexistent_session_returns_404():
    res = client.get("/api/v1/sessions/non-existent-uuid-1234")
    assert res.status_code == 404

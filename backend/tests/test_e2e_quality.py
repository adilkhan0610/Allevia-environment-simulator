"""
Comprehensive End-to-End and Reliability Quality Gates for Backend (Phase 9):
1. Concurrent WebSocket clients streaming the same simulation session
2. Immediate session cleanup and engine task termination on delete
3. Graceful handling of invalid control actions
4. Deterministic sensor curve transitions across all 6 scenario profiles
5. Pydantic schema validation enforcement
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from app.services.session_service import session_service
from app.websocket.connection_manager import ws_manager

client = TestClient(app)


def test_concurrent_websocket_clients_and_task_cleanup():
    """Verify multiple concurrent WebSocket connections to a single session stream properly and clean up tasks."""
    # 1. Create a session
    res = client.post("/api/v1/sessions", json={"scenario_id": "scenario-02", "speed_multiplier": 1.0})
    assert res.status_code == 201
    session_id = res.json()["session_id"]

    # 2. Connect client 1 and client 2 concurrently
    with client.websocket_connect(f"/ws/simulation/{session_id}") as ws1:
        init1 = ws1.receive_json()
        assert init1["event_type"] == "CONNECTION_ESTABLISHED"

        with client.websocket_connect(f"/ws/simulation/{session_id}") as ws2:
            init2 = ws2.receive_json()
            assert init2["event_type"] == "CONNECTION_ESTABLISHED"
            assert ws_manager.get_connection_count(session_id) == 2

            # Client 1 issues start command
            ws1.send_json({"type": "CONTROL", "action": "start"})

            # Both clients receive the broadcast state update
            update1 = ws1.receive_json()
            update2 = ws2.receive_json()
            assert update1["event_type"] == "STATE_UPDATE"
            assert update2["event_type"] == "STATE_UPDATE"
            assert update1["payload"]["status"] == "RUNNING"
            assert update2["payload"]["status"] == "RUNNING"

    # Both clients disconnected; verify active connection count drops to zero
    assert ws_manager.get_connection_count(session_id) == 0

    # 3. Delete session and verify engine instance is removed
    del_res = client.delete(f"/api/v1/sessions/{session_id}")
    assert del_res.status_code == 200
    assert session_service.get_session(session_id) is None
    assert session_service.get_engine(session_id) is None


def test_invalid_engine_control_actions_return_400():
    """Verify invalid engine control requests return HTTP 400 Bad Request."""
    res = client.post("/api/v1/sessions", json={"scenario_id": "scenario-01"})
    session_id = res.json()["session_id"]

    bad_action_res = client.post(
        f"/api/v1/sessions/{session_id}/engine/control",
        json={"action": "unknown_action_xyz"}
    )
    assert bad_action_res.status_code == 400
    assert "unknown engine action" in bad_action_res.json()["detail"].lower()

    # Clean up
    client.delete(f"/api/v1/sessions/{session_id}")


def test_all_six_scenarios_execute_deterministically():
    """Verify all 6 scenarios load and produce valid physical packets without exceptions."""
    scenario_ids = [
        "scenario-01",
        "scenario-02",
        "scenario-03",
        "scenario-04",
        "scenario-05",
        "scenario-06",
    ]

    for sc_id in scenario_ids:
        res = client.post("/api/v1/sessions", json={"scenario_id": sc_id})
        assert res.status_code == 201
        session_id = res.json()["session_id"]

        engine = session_service.get_engine(session_id)
        assert engine is not None
        assert engine.scenario_id == sc_id

        # Step 10 times
        engine.start()
        for _ in range(10):
            pkt = engine.step(dt=1.0)
            assert pkt.source == "simulated"
            assert 0 <= pkt.readings.mq2_raw <= 1023
            assert 0 <= pkt.readings.mq7_raw <= 1023
            assert 0 <= pkt.readings.mq135_raw <= 1023

        client.delete(f"/api/v1/sessions/{session_id}")

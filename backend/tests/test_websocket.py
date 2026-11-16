import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect
from main import app

client = TestClient(app)


def test_websocket_connection_with_valid_session():
    # 1. Create a session first
    create_res = client.post("/api/v1/sessions", json={"scenario_id": "scenario-01"})
    assert create_res.status_code == 201
    session_id = create_res.json()["session_id"]

    # 2. Connect via WebSocket
    with client.websocket_connect(f"/ws/simulation/{session_id}") as websocket:
        # Initial greeting event
        init_data = websocket.receive_json()
        assert init_data["event_type"] == "CONNECTION_ESTABLISHED"
        assert init_data["session_id"] == session_id
        assert init_data["source"] == "simulated"

        # Ping-pong test
        websocket.send_text("PING")
        pong_data = websocket.receive_json()
        assert pong_data["event_type"] == "PONG"
        assert pong_data["session_id"] == session_id

        # Text heartbeat ack test
        websocket.send_text("CUSTOM_HEARTBEAT")
        ack_data = websocket.receive_json()
        assert ack_data["event_type"] == "HEARTBEAT_ACK"
        assert ack_data["session_id"] == session_id
        assert ack_data["received"] == "CUSTOM_HEARTBEAT"

        # Control message over WebSocket
        websocket.send_json({"type": "CONTROL", "action": "start"})
        state_data = websocket.receive_json()
        assert state_data["event_type"] == "STATE_UPDATE"
        assert state_data["payload"]["status"] == "RUNNING"


def test_websocket_connection_with_invalid_session_closes():
    with client.websocket_connect("/ws/simulation/invalid-session-999") as websocket:
        data = websocket.receive_json()
        assert data["error"] == "SESSION_NOT_FOUND"
        with pytest.raises(WebSocketDisconnect):
            websocket.receive_text()

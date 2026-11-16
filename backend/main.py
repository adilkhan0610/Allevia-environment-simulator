from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router
from app.api.endpoints.health import router as health_router
from app.services.session_service import session_service
from app.websocket.connection_manager import ws_manager
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("allevia-simulator")

app = FastAPI(
    title=settings.APP_NAME,
    description="Standalone Hardware Simulator Backend for ALLEVIA Detector Box",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router)  # Exposes /health
app.include_router(api_router)     # Exposes /api/v1/...


# WebSocket Simulation Stream Endpoint
@app.websocket("/ws/simulation/{session_id}")
async def websocket_simulation_endpoint(websocket: WebSocket, session_id: str):
    # Verify session exists
    session = session_service.get_session(session_id)
    if not session:
        # Accept and close with code 4404 if invalid session
        await websocket.accept()
        await websocket.send_json({
            "error": "SESSION_NOT_FOUND",
            "message": f"Simulation session '{session_id}' does not exist or has expired",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await ws_manager.connect(websocket, session_id)
    engine = session_service.get_engine(session_id)
    if engine:
        # Start streaming task
        ws_manager.start_streaming_task(session_id, engine, session, interval_sec=1.0)

    try:
        # Send initial connection handshake
        await websocket.send_json({
            "event_type": "CONNECTION_ESTABLISHED",
            "session_id": session_id,
            "device_id": session.device_id,
            "source": session.source,
            "status": session.status,
            "scenario_id": session.selected_scenario,
            "speed_multiplier": session.speed_multiplier,
            "intensity_multiplier": session.intensity_multiplier,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        while True:
            # Receive client ping or command
            raw_text = await websocket.receive_text()
            try:
                import json
                msg = json.loads(raw_text)
                msg_type = msg.get("type", "").upper()
                if msg_type == "PING":
                    await websocket.send_json({
                        "event_type": "PONG",
                        "session_id": session_id,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                elif msg_type == "CONTROL" and engine:
                    action = msg.get("action", "").lower()
                    if action == "start":
                        engine.start()
                        session.status = "RUNNING"
                    elif action == "pause":
                        engine.pause()
                        session.status = "PAUSED"
                    elif action == "resume":
                        engine.resume()
                        session.status = "RUNNING"
                    elif action == "stop":
                        engine.stop()
                        session.status = "STOPPED"
                    elif action == "reset":
                        engine.reset()
                        session.status = "IDLE"
                    elif action == "speed" and "speed_multiplier" in msg:
                        spd = float(msg["speed_multiplier"])
                        engine.set_speed(spd)
                        session.speed_multiplier = spd
                    elif action == "scenario" and "scenario_id" in msg:
                        sc_id = msg["scenario_id"]
                        engine.load_scenario(sc_id)
                        session.selected_scenario = sc_id
                    elif action == "fault" and "sensor_name" in msg:
                        engine.set_fault(msg["sensor_name"], msg.get("fault_type"))
                    elif action == "clear_faults":
                        engine.clear_all_faults()

                    # Broadcast state update to all connected clients
                    await ws_manager.broadcast_event(session_id, "STATE_UPDATE", {
                        "status": session.status,
                        "scenario_id": session.selected_scenario,
                        "speed_multiplier": session.speed_multiplier,
                        "intensity_multiplier": session.intensity_multiplier,
                        "sim_time_sec": engine.sim_time_sec,
                    })
                else:
                    await websocket.send_json({
                        "event_type": "HEARTBEAT_ACK",
                        "session_id": session_id,
                        "received": raw_text,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
            except json.JSONDecodeError:
                # Raw text heartbeat / ping
                if raw_text.strip().upper() == "PING":
                    await websocket.send_json({
                        "event_type": "PONG",
                        "session_id": session_id,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                else:
                    await websocket.send_json({
                        "event_type": "HEARTBEAT_ACK",
                        "session_id": session_id,
                        "received": raw_text,
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, session_id)
    except Exception as e:
        logger.error(f"WebSocket error in session {session_id}: {e}")
        ws_manager.disconnect(websocket, session_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)

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
    try:
        # Send initial connection handshake
        await websocket.send_json({
            "event_type": "CONNECTION_ESTABLISHED",
            "session_id": session_id,
            "device_id": session.device_id,
            "source": session.source,
            "status": session.status,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        while True:
            # Receive client ping or command
            data = await websocket.receive_text()
            # Basic echo/heartbeat response for foundation phase
            await websocket.send_json({
                "event_type": "HEARTBEAT_ACK",
                "session_id": session_id,
                "received": data,
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

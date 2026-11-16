import asyncio
import logging
from typing import Dict, List, Optional
from fastapi import WebSocket
from app.schemas.telemetry import TelemetryPacket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages active WebSocket connections per session and coordinates real-time
    asynchronous telemetry streaming tasks powered by the Phase 5 LocalSimulationEngine.
    """

    def __init__(self):
        # Map session_id to list of active WebSockets
        self._active_connections: Dict[str, List[WebSocket]] = {}
        # Map session_id to running asyncio streaming background task
        self._streaming_tasks: Dict[str, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self._active_connections:
            self._active_connections[session_id] = []
        self._active_connections[session_id].append(websocket)
        logger.info(f"WebSocket client connected to session: {session_id}")

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self._active_connections:
            if websocket in self._active_connections[session_id]:
                self._active_connections[session_id].remove(websocket)
            if not self._active_connections[session_id]:
                del self._active_connections[session_id]
                # Stop streaming task if no clients remain connected
                self.stop_streaming_task(session_id)
        logger.info(f"WebSocket client disconnected from session: {session_id}")

    def stop_streaming_task(self, session_id: str):
        task = self._streaming_tasks.pop(session_id, None)
        if task and not task.done():
            task.cancel()
            logger.info(f"Cancelled background streaming task for session {session_id}")

    def start_streaming_task(self, session_id: str, engine, session_model, interval_sec: float = 1.0):
        """Starts asynchronous background streaming loop if not already running."""
        if session_id in self._streaming_tasks and not self._streaming_tasks[session_id].done():
            return  # Already running

        async def _stream_loop():
            try:
                while True:
                    # Check if session has active clients
                    if self.get_connection_count(session_id) == 0:
                        break

                    # Step engine if engine is running
                    if engine.is_running and not engine.is_paused:
                        # Advance engine by dt = 1.0 (engine internally factors speed_multiplier)
                        packet: TelemetryPacket = engine.step(dt=1.0)
                        session_model.sim_time_sec = engine.sim_time_sec
                        session_model.sequence_counter = packet.sequence_number

                        event_data = {
                            "event_type": "TELEMETRY_PACKET",
                            "session_id": session_id,
                            "timestamp": packet.timestamp.isoformat(),
                            "payload": packet.model_dump(mode="json"),
                        }
                        await self.send_json(session_id, event_data)

                    # Dynamic sleep adjusted for real-time responsiveness (default 1.0s / 10Hz if speed is high)
                    await asyncio.sleep(interval_sec)
            except asyncio.CancelledError:
                logger.debug(f"Streaming loop cancelled for session {session_id}")
            except Exception as e:
                logger.error(f"Error in streaming loop for {session_id}: {e}")
            finally:
                self._streaming_tasks.pop(session_id, None)

        self._streaming_tasks[session_id] = asyncio.create_task(_stream_loop())
        logger.info(f"Started streaming background task for session {session_id}")

    async def broadcast_event(self, session_id: str, event_type: str, payload: dict):
        event_data = {
            "event_type": event_type,
            "session_id": session_id,
            "payload": payload,
        }
        await self.send_json(session_id, event_data)

    async def send_json(self, session_id: str, data: dict):
        if session_id in self._active_connections:
            for connection in list(self._active_connections[session_id]):
                try:
                    await connection.send_json(data)
                except Exception as e:
                    logger.warning(f"Failed to send JSON to connection in {session_id}: {e}")
                    self.disconnect(connection, session_id)

    def get_connection_count(self, session_id: str) -> int:
        return len(self._active_connections.get(session_id, []))


ws_manager = ConnectionManager()

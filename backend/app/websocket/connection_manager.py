from typing import Dict, List
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Map session_id to list of active WebSockets
        self._active_connections: Dict[str, List[WebSocket]] = {}

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
        logger.info(f"WebSocket client disconnected from session: {session_id}")

    async def send_json(self, session_id: str, data: dict):
        if session_id in self._active_connections:
            # Copy list to handle disconnections safely
            for connection in list(self._active_connections[session_id]):
                try:
                    await connection.send_json(data)
                except Exception as e:
                    logger.warning(f"Failed to send JSON to connection in {session_id}: {e}")
                    self.disconnect(connection, session_id)

    def get_connection_count(self, session_id: str) -> int:
        return len(self._active_connections.get(session_id, []))


ws_manager = ConnectionManager()

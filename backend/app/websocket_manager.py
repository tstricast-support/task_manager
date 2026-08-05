import json
from typing import Dict

from fastapi import WebSocket


class ConnectionManager:
    """
    Tracks one active WebSocket connection per employee_id.
    For multi-instance/production deployments, back this with Redis pub/sub
    instead of an in-memory dict so notifications reach the right pod.
    """

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, employee_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections[employee_id] = websocket

    def disconnect(self, employee_id: str) -> None:
        self.active_connections.pop(employee_id, None)

    async def send_personal_message(self, employee_id: str, message: dict) -> None:
        websocket = self.active_connections.get(employee_id)
        if websocket is not None:
            await websocket.send_text(json.dumps(message, default=str))

    async def broadcast(self, message: dict) -> None:
        for connection in self.active_connections.values():
            await connection.send_text(json.dumps(message, default=str))


# Single shared instance imported by both the WebSocket route and the
# admin route that triggers notifications.
manager = ConnectionManager()

import jwt
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status

from ..auth import decode_access_token
from ..websocket_manager import manager

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws/{employee_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    employee_id: str,
    token: str = Query(..., description="JWT access token for this employee"),
):
    """
    Real-time channel for one employee. The client connects with:
        wss://host/ws/EMP101?token=<jwt access token>

    The token's `sub` claim must match the employee_id in the path, so an
    employee can only open their own channel.
    """
    try:
        payload = decode_access_token(token)
        if payload.get("sub") != employee_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except jwt.PyJWTError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(employee_id, websocket)
    try:
        while True:
            # Keep the connection alive; client pings/messages are read but
            # not required to carry any meaning for this app.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(employee_id)

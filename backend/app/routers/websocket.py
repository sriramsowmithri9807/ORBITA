from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # mission_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, mission_id: str):
        await websocket.accept()
        if mission_id not in self.active_connections:
            self.active_connections[mission_id] = []
        self.active_connections[mission_id].append(websocket)

    def disconnect(self, websocket: WebSocket, mission_id: str):
        if mission_id in self.active_connections:
            if websocket in self.active_connections[mission_id]:
                self.active_connections[mission_id].remove(websocket)
            if not self.active_connections[mission_id]:
                del self.active_connections[mission_id]

    async def broadcast_mission_update(self, mission_id: int, data: dict):
        str_id = str(mission_id)
        if str_id in self.active_connections:
            for connection in self.active_connections[str_id]:
                try:
                    await connection.send_json(data)
                except Exception as e:
                    print(f"Error broadcasting to {str_id}: {e}")

manager = ConnectionManager()

@router.websocket("/mission/live/{mission_id}")
async def websocket_endpoint(websocket: WebSocket, mission_id: str):
    await manager.connect(websocket, mission_id)
    try:
        while True:
            # Keep connection alive, maybe receive commands from frontend later
            data = await websocket.receive_text()
            # Echo for pong or ignoring
    except WebSocketDisconnect:
        manager.disconnect(websocket, mission_id)

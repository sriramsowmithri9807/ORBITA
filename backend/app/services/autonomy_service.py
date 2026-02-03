import asyncio
import logging
from .telemetry_service import TelemetryService
from .ai_service import AIService
from .mission_service import MissionService
from ..database import SessionLocal
from .. import schemas

logger = logging.getLogger(__name__)

class AutonomyEngine:
    """
    Manages the lifecycle of autonomous loops for active missions.
    """
    def __init__(self):
        self.active_tasks = {} # mission_id -> asyncio.Task
        self.telemetry_service = TelemetryService()
        self.ai_service = AIService()
        # In-memory measurement of last state for each mission to evolve it
        self.mission_states = {} # mission_id -> TelemetryCreate (latest)

    async def start_mission_loop(self, mission_id: int, satellite_type: str):
        if mission_id in self.active_tasks:
            return # Already running

        # Initialize state
        initial_telemetry = self.telemetry_service.generate_initial_telemetry(satellite_type)
        self.mission_states[mission_id] = initial_telemetry
        
        # Determine frequency (LEO faster, GEO slower)
        interval = 2.0 if satellite_type == 'LEO' else 3.0
        
        task = asyncio.create_task(self._mission_loop(mission_id, satellite_type, interval))
        self.active_tasks[mission_id] = task
        logger.info(f"Started autonomy loop for Mission {mission_id}")

    async def stop_mission_loop(self, mission_id: int):
        if mission_id in self.active_tasks:
            self.active_tasks[mission_id].cancel()
            del self.active_tasks[mission_id]
            if mission_id in self.mission_states:
                del self.mission_states[mission_id]
            logger.info(f"Stopped autonomy loop for Mission {mission_id}")

    async def _mission_loop(self, mission_id: int, satellite_type: str, interval: float, source: str = "SIM"):
        from ..routers.websocket import manager # Import here to avoid circular dependency if possible
        from .ingest_service import TelemetryIngestService
        
        ingest_service = TelemetryIngestService()
        
        try:
            while True:
                async with SessionLocal() as db:
                    mission_service = MissionService(db)
                    
                    # 1. Get Telemetry (SIM or REAL)
                    current_state = self.mission_states.get(mission_id)
                    new_state = None
                    
                    if source == "REAL":
                        # Attempt to fetch real data
                        real_data = await ingest_service.fetch_latest_state(str(mission_id))
                        if real_data:
                            new_state = real_data
                        else:
                            # Fallback to sim if real connection fails/mocked
                            new_state = self.telemetry_service.evolve_telemetry(current_state, satellite_type)
                    else:
                        new_state = self.telemetry_service.evolve_telemetry(current_state, satellite_type)
                    
                    self.mission_states[mission_id] = new_state
                    
                    # 2. Log to DB
                    # (Optional: optimization - don't log EVERY tick to DB if high frequency, but for demo it's fine)
                    await mission_service.log_telemetry(mission_id, new_state)
                    
                    # 3. AI Analysis
                    decision = await self.ai_service.analyze_telemetry(new_state)
                    
                    # Only log if anomaly detected
                    if decision.anomaly_detected:
                        await mission_service.log_decision(mission_id, decision)
                        
                        # Corrective Action Simulation (simple override for demo)
                        # In REAL mode, we would send commands BACK to the satellite here
                        if source == "SIM":
                            action_text = decision.selected_action.lower() if decision.selected_action else ""
                            reasoning_text = decision.explanation.lower()
                            
                            if "battery" in action_text or "load shedding" in action_text:
                                 # fix battery
                                 self.mission_states[mission_id].battery_level = 80.0
                            elif "thermal" in action_text or "radiator" in action_text:
                                 self.mission_states[mission_id].thermal_state = 20.0
                            elif "thruster" in action_text or "stabilization" in reasoning_text:
                                 self.mission_states[mission_id].is_stable = True
                                 self.mission_states[mission_id].orientation_roll = 0.0
                            elif "angle" in action_text:
                                 # optimize solar angle -> better battery
                                 self.mission_states[mission_id].battery_level += 5.0
                        
                        logger.info(f"Mission {mission_id} AI Action: {decision.selected_action}")

                    # 4. Broadcast via WebSocket
                    await manager.broadcast_mission_update(mission_id, {
                        "telemetry": new_state.model_dump(),
                        "decision": decision.model_dump() if decision.anomaly_detected else None,
                        "source": source
                    })

                await asyncio.sleep(interval)
        except asyncio.CancelledError:
            logger.info(f"Mission {mission_id} loop cancelled")
        except Exception as e:
            logger.error(f"Error in mission loop {mission_id}: {e}")
            
# Global instance
engine = AutonomyEngine()

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .. import models, schemas

class MissionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_mission(self, mission: schemas.MissionCreate):
        db_mission = models.Mission(
            name=mission.name,
            satellite_type=mission.satellite_type,
            altitude=mission.altitude,
            inclination=mission.inclination
        )
        self.db.add(db_mission)
        await self.db.commit()
        await self.db.refresh(db_mission)
        return db_mission

    async def get_mission(self, mission_id: int):
        result = await self.db.execute(select(models.Mission).filter(models.Mission.id == mission_id))
        return result.scalars().first()

    async def get_active_missions(self):
        result = await self.db.execute(select(models.Mission).where(models.Mission.is_active == True))
        return result.scalars().all()
    
    async def log_telemetry(self, mission_id: int, data: schemas.TelemetryCreate):
        db_log = models.TelemetryLog(
            mission_id=mission_id,
            battery_level=data.battery_level,
            thermal_state=data.thermal_state,
            orientation_roll=data.orientation_roll,
            orientation_pitch=data.orientation_pitch,
            orientation_yaw=data.orientation_yaw,
            signal_latency=data.signal_latency,
            is_stable=data.is_stable
        )
        self.db.add(db_log)
        await self.db.commit()
        await self.db.refresh(db_log)
        return db_log

    async def log_decision(self, mission_id: int, decision: schemas.AIResponse):
        # Convert Pydantic list of objects to list of dicts for JSON storage
        recovery_dicts = [action.model_dump() for action in decision.recovery_actions_considered]
        
        db_decision = models.DecisionLog(
            mission_id=mission_id,
            anomaly_detected=decision.anomaly_type,
            action_taken=decision.selected_action,
            reasoning=decision.explanation,
            confidence_score=decision.confidence,
            root_cause=decision.root_cause_hypothesis,
            recovery_options=recovery_dicts, # SQLAlchemy JSON field handles dicts/lists
            outcome_verified=None 
        )
        self.db.add(db_decision)
        await self.db.commit()
        return db_decision

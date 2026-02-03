from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from .. import schemas
from ..services.mission_service import MissionService
from ..services.autonomy_service import engine as autonomy_engine

router = APIRouter()

@router.post("/create", response_model=schemas.Mission)
async def create_mission(
    mission: schemas.MissionCreate, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    service = MissionService(db)
    db_mission = await service.create_mission(mission)
    
    # Auto-start for convenience if requested, or just leave it created
    # Let's auto-start strictly
    background_tasks.add_task(
        autonomy_engine.start_mission_loop, 
        db_mission.id, 
        db_mission.satellite_type
    )
    
    return db_mission

@router.get("/{mission_id}", response_model=schemas.Mission)
async def get_mission(mission_id: int, db: AsyncSession = Depends(get_db)):
    service = MissionService(db)
    mission = await service.get_mission(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return mission

@router.post("/{mission_id}/start")
async def start_mission(mission_id: int, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    service = MissionService(db)
    mission = await service.get_mission(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    background_tasks.add_task(autonomy_engine.start_mission_loop, mission.id, mission.satellite_type)
    return {"message": "Mission started"}

@router.post("/{mission_id}/stop")
async def stop_mission(mission_id: int):
    await autonomy_engine.stop_mission_loop(mission_id)
    return {"message": "Mission stopped"}

@router.get("/{mission_id}/report")
async def get_report(mission_id: int, db: AsyncSession = Depends(get_db)):
    # Simple report aggregation
    service = MissionService(db)
    mission = await service.get_mission(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
        
    return {
        "mission_name": mission.name,
        "satellite": mission.satellite_type,
        "total_anomalies": len(mission.decisions),
        "decisions": mission.decisions
    }

@router.get("/{mission_id}/forecast")
async def get_forecast(mission_id: str):
    # Flexible ID handling
    try:
        m_id = int(mission_id.replace("mission-", ""))
    except:
        m_id = 1

    from ..services.forecast_service import ForecastService
    forecaster = ForecastService()
    # Mock starting battery at 85% for now, ideally fetch from DB
    return forecaster.generate_power_forecast(current_battery=85.0)

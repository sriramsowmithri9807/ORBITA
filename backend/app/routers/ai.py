from fastapi import APIRouter, Depends
from .. import schemas
from ..services.ai_service import AIService

router = APIRouter()

@router.post("/analyze", response_model=schemas.AIResponse)
async def analyze_telemetry(telemetry: schemas.TelemetryCreate):
    """
    Directly invoke the AI logic with custom telemetry.
    Useful for testing specific scenarios (e.g., verifying anomaly detection).
    """
    ai_service = AIService()
    response = await ai_service.analyze_telemetry(telemetry)
    return response

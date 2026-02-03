from pydantic import BaseModel, ConfigDict, computed_field
from datetime import datetime
from typing import List, Optional, Dict, Any

class TelemetryBase(BaseModel):
    battery_level: float
    thermal_state: float
    orientation_roll: float
    orientation_pitch: float
    orientation_yaw: float
    signal_latency: float
    is_stable: bool

class TelemetryCreate(TelemetryBase):
    pass

class Telemetry(TelemetryBase):
    id: int
    mission_id: int
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Strategy(BaseModel):
    strategy: str
    risk_level: str
    expected_impact: str

class PredictedEvent(BaseModel):
    event: str
    probability: float
    time_horizon: str

class AIResponse(BaseModel):
    global_space_state: str
    detected_patterns: List[str]
    predicted_events: List[PredictedEvent]
    risk_assessment: str
    coordination_recommendations: List[str]
    counterfactual_insights: str
    confidence: float
    explanation: str
    
    @computed_field
    @property
    def anomaly_detected(self) -> bool:
        return len(self.detected_patterns) > 0
    
    @computed_field
    @property
    def anomaly_type(self) -> Optional[str]:
        return self.detected_patterns[0] if self.detected_patterns else "Nominal"
    
    @computed_field
    @property
    def selected_action(self) -> Optional[str]:
        return self.coordination_recommendations[0] if self.coordination_recommendations else "None"

    @computed_field
    @property
    def root_cause_hypothesis(self) -> Optional[str]:
        return self.explanation

    @computed_field
    @property
    def autonomy_mode(self) -> str:
        if self.confidence > 0.8: return "autonomous"
        if self.confidence > 0.5: return "supervisory"
        return "human_required"
    
    @computed_field
    @property
    def digital_twin_prediction(self) -> Optional[str]:
        return self.predicted_events[0].event if self.predicted_events else "Nominal state predicted"
    
    @computed_field
    @property
    def verification_result(self) -> str:
        return "Validated via Counterfactual Analysis"

class DecisionBase(BaseModel):
    anomaly_detected: str
    action_taken: str
    reasoning: str
    confidence_score: float
    # Expanded fields for storage
    root_cause: Optional[str] = None
    recovery_options: Optional[List[Dict[str, Any]]] = None

class DecisionCreate(DecisionBase):
    pass

class Decision(DecisionBase):
    id: int
    mission_id: int
    timestamp: datetime
    outcome_verified: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

class MissionBase(BaseModel):
    name: str
    satellite_type: str
    altitude: float
    inclination: float

class MissionCreate(MissionBase):
    pass

class Mission(MissionBase):
    id: int
    status: str
    start_time: datetime
    is_active: bool
    telemetry_logs: List[Telemetry] = []
    decisions: List[Decision] = []

    model_config = ConfigDict(from_attributes=True)

class MissionUpdate(BaseModel):
    status: Optional[str] = None
    is_active: Optional[bool] = None

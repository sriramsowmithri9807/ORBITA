from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    satellite_type = Column(String)  # LEO, MEO, GEO
    status = Column(String, default="nominal")  # nominal, warning, critical
    start_time = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Orbit Parameters
    altitude = Column(Float)
    inclination = Column(Float)
    
    # Relationships
    telemetry_logs = relationship("TelemetryLog", back_populates="mission", cascade="all, delete-orphan")
    decisions = relationship("DecisionLog", back_populates="mission", cascade="all, delete-orphan")

class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    battery_level = Column(Float)
    thermal_state = Column(Float)
    orientation_roll = Column(Float)
    orientation_pitch = Column(Float)
    orientation_yaw = Column(Float)
    signal_latency = Column(Float)
    is_stable = Column(Boolean)
    
    mission = relationship("Mission", back_populates="telemetry_logs")

class DecisionLog(Base):
    __tablename__ = "decision_logs"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    anomaly_detected = Column(String) # Maps to anomaly_type
    action_taken = Column(String, nullable=True) # Maps to selected_action
    reasoning = Column(Text) # Maps to explanation
    confidence_score = Column(Float)
    
    # New fields for advanced reasoning
    root_cause = Column(Text, nullable=True)
    recovery_options = Column(JSON, nullable=True) # List of actions considered
    
    outcome_verified = Column(Boolean, nullable=True)
    
    mission = relationship("Mission", back_populates="decisions")

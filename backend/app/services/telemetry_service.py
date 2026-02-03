import random
import math
from datetime import datetime
from .. import schemas

class TelemetryService:
    def __init__(self):
        # Base parameters for different satellite types
        self.bases = {
            "LEO": {"battery": 90, "thermal": 20, "latency": 50},
            "MEO": {"battery": 85, "thermal": 10, "latency": 150},
            "GEO": {"battery": 95, "thermal": -50, "latency": 250},
        }

    def generate_initial_telemetry(self, satellite_type: str) -> schemas.TelemetryCreate:
        base = self.bases.get(satellite_type, self.bases["LEO"])
        
        return schemas.TelemetryCreate(
            battery_level=base["battery"],
            thermal_state=base["thermal"],
            orientation_roll=0.0,
            orientation_pitch=0.0,
            orientation_yaw=0.0,
            signal_latency=base["latency"],
            is_stable=True
        )

    def evolve_telemetry(self, current: schemas.TelemetryCreate, satellite_type: str) -> schemas.TelemetryCreate:
        base = self.bases.get(satellite_type, self.bases["LEO"])
        
        # Random drift
        battery_drift = random.uniform(-0.5, 0.1)  # Tend to drain slightly
        thermal_drift = random.uniform(-1.0, 1.0)
        latency_noise = random.uniform(-5, 5)
        
        # Simulate orbital mechanics for orientation (simplified)
        # Just some gentle rotation
        roll_drift = random.uniform(-0.1, 0.1)
        pitch_drift = random.uniform(-0.1, 0.1)
        yaw_drift = random.uniform(-0.1, 0.1)

        # Apply drift
        new_battery = max(0, min(100, current.battery_level + battery_drift))
        
        # Thermal cycle (simulating sun/eclipse slightly)
        time_factor = math.sin(datetime.utcnow().timestamp() / 300) * 2
        new_thermal = current.thermal_state + thermal_drift + (time_factor * 0.1)

        new_latency = max(10, current.signal_latency + latency_noise)

        # Update orientation
        new_roll = (current.orientation_roll + roll_drift) % 360
        new_pitch = (current.orientation_pitch + pitch_drift) % 360
        new_yaw = (current.orientation_yaw + yaw_drift) % 360
        
        is_stable = True
        
        # Inject occasional random anomalies
        if random.random() < 0.05: # 5% chance of anomaly per tick
            anomaly_type = random.choice(["thermal", "power", "orientation"])
            if anomaly_type == "thermal":
                new_thermal += random.uniform(20, 40) # Sudden heat spike
            elif anomaly_type == "power":
                new_battery -= random.uniform(5, 10) # Power drop
            elif anomaly_type == "orientation":
                new_roll += random.uniform(15, 30) # Sudden jolt
                is_stable = False

        return schemas.TelemetryCreate(
            battery_level=new_battery,
            thermal_state=new_thermal,
            orientation_roll=new_roll,
            orientation_pitch=new_pitch,
            orientation_yaw=new_yaw,
            signal_latency=new_latency,
            is_stable=is_stable
        )

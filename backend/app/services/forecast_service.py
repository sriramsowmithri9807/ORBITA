from datetime import datetime, timedelta
import math
from typing import List, Dict

class ForecastService:
    """
    Predicts future satellite states based on orbital mechanics and resource models.
    Useful for mission planning and survival analysis (e.g., Eclipse Power Budget).
    """

    def generate_power_forecast(self, current_battery: float, orbital_period_min: float = 90) -> Dict[str, List]:
        """
        Simulates battery levels for the next 24 hours (1440 minutes).
        Assumes:
        - 60% of orbit is sunlight (Charge)
        - 40% of orbit is eclipse (Discharge)
        """
        timestamps = []
        battery_levels = []
        phases = [] # 'Sunlight' or 'Eclipse'

        # Simulation Parameters
        sim_duration_hours = 24
        steps_per_hour = 4 # 15 min resolution
        total_steps = sim_duration_hours * steps_per_hour
        
        charge_rate = 2.5 # % per 15 min
        discharge_rate = 1.0 # % per 15 min (base load)
        
        current_level = current_battery
        start_time = datetime.utcnow()

        for step in range(total_steps):
            time_offset = step * (60 / steps_per_hour) # minutes
            orbit_phase = (time_offset % orbital_period_min) / orbital_period_min
            
            # Simple Eclipse Model: 0.0-0.6 is Sun, 0.6-1.0 is Eclipse
            is_eclipse = orbit_phase > 0.6
            
            if is_eclipse:
                current_level -= discharge_rate
                phases.append("Eclipse")
            else:
                current_level += charge_rate
                phases.append("Sunlight")

            # Clamp
            current_level = max(0.0, min(100.0, current_level))
            
            timestamps.append((start_time + timedelta(minutes=time_offset)).isoformat())
            battery_levels.append(round(current_level, 2))

        return {
            "timestamps": timestamps,
            "battery_levels": battery_levels,
            "phases": phases,
            "survival_probability": 1.0 if min(battery_levels) > 10 else 0.0 # Critical if drops < 10%
        }

"""
Core Local Simulation Engine.
Coordinates:
- Environmental scenario curves and keyframe interpolation
- Physical sensor models (BME280, MQ-2, MQ-7, MQ-135, IR Sensor)
- Hardware housekeeping and 10-bit ADC quantization
- Local simulated event processor and risk tier computation
- Simulation clock, pause/resume, speed multiplier, reset, and fault injection
- Real-time telemetry history ring buffer
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from collections import deque

from app.schemas.telemetry import (
    TelemetryPacket,
    SensorReadings,
    BME280Readings,
    GasSensorDetails,
    DeviceHealth,
)
from app.simulator.math_models import SeededRNG, ADCQuantizer
from app.simulator.sensor_models import (
    BME280Model,
    MQ2Model,
    MQ7Model,
    MQ135Model,
    IRSensorModel,
    DeviceHousekeepingModel,
)
from app.simulator.scenario_curve import ScenarioProfile
from app.simulator.scenario_profiles import SCENARIO_PROFILES
from app.simulator.event_processor import LocalEventProcessor, RiskTierResult


class LocalSimulationEngine:
    """
    Independent local simulation engine modeling physical Detector Box telemetry.
    Can be stepped deterministically with a simulated time delta dt (controllable clock)
    without relying on real-time wall-clock sleep.
    """

    def __init__(
        self,
        session_id: str,
        device_id: str = "ALLEVIA-SIM-01",
        scenario_id: str = "scenario-01",
        seed: int = 42,
        speed_multiplier: float = 1.0,
        intensity_multiplier: float = 1.0,
        history_capacity: int = 100,
    ):
        self.session_id = session_id
        self.device_id = device_id
        self.scenario_id = scenario_id
        self.initial_seed = seed
        self.speed_multiplier = max(0.1, min(10.0, speed_multiplier))
        self.intensity_multiplier = max(0.1, min(3.0, intensity_multiplier))

        # Simulation clock state
        self.sim_time_sec = 0.0
        self.is_running = False
        self.is_paused = False

        # RNG & Quantizer
        self.rng = SeededRNG(seed=seed)
        self.adc = ADCQuantizer(v_ref=5.0, bit_depth=10)

        # Sensors
        self.bme280 = BME280Model(rng=self.rng)
        self.mq2 = MQ2Model(rng=self.rng, adc=self.adc)
        self.mq7 = MQ7Model(rng=self.rng, adc=self.adc)
        self.mq135 = MQ135Model(rng=self.rng, adc=self.adc)
        self.ir = IRSensorModel(rng=self.rng)
        self.housekeeping = DeviceHousekeepingModel(rng=self.rng)

        # Event processor
        self.event_processor = LocalEventProcessor()

        # Telemetry History Ring Buffer
        self.history: deque[TelemetryPacket] = deque(maxlen=history_capacity)

        # Load Scenario Profile
        self.load_scenario(scenario_id)

    def load_scenario(self, scenario_id: str) -> None:
        """Loads and configures the scenario profile."""
        profile_data = SCENARIO_PROFILES.get(scenario_id)
        if not profile_data:
            # Fallback to scenario-01
            profile_data = SCENARIO_PROFILES["scenario-01"]
            scenario_id = "scenario-01"

        self.scenario_id = scenario_id
        self.scenario_profile = ScenarioProfile(**profile_data)
        # Reseed deterministic RNG for scenario reproducibility
        combined_seed = self.initial_seed ^ self.scenario_profile.random_seed
        self.rng.reseed(combined_seed)

    def set_fault(self, sensor_name: str, fault_type: Optional[str]) -> None:
        """Injects or clears sensor hardware faults."""
        name = sensor_name.lower()
        if "bme" in name:
            self.bme280.set_fault(fault_type)
        elif "mq2" in name:
            self.mq2.set_fault(fault_type)
        elif "mq7" in name:
            self.mq7.set_fault(fault_type)
        elif "mq135" in name:
            self.mq135.set_fault(fault_type)
        elif "ir" in name:
            self.ir.set_fault(fault_type)

    def clear_all_faults(self) -> None:
        self.bme280.set_fault(None)
        self.mq2.set_fault(None)
        self.mq7.set_fault(None)
        self.mq135.set_fault(None)
        self.ir.set_fault(None)

    def start(self) -> None:
        self.is_running = True
        self.is_paused = False

    def pause(self) -> None:
        if self.is_running:
            self.is_paused = True

    def resume(self) -> None:
        if self.is_running:
            self.is_paused = False

    def stop(self) -> None:
        self.is_running = False
        self.is_paused = False

    def reset(self) -> None:
        self.sim_time_sec = 0.0
        self.is_running = False
        self.is_paused = False
        self.rng.reseed(self.initial_seed ^ self.scenario_profile.random_seed)
        self.bme280.reset()
        self.mq2.reset()
        self.mq7.reset()
        self.mq135.reset()
        self.ir.reset()
        self.housekeeping.reset()
        self.clear_all_faults()
        self.history.clear()

    def set_speed(self, speed_multiplier: float) -> None:
        self.speed_multiplier = max(0.1, min(10.0, speed_multiplier))

    def set_intensity(self, intensity_multiplier: float) -> None:
        self.intensity_multiplier = max(0.1, min(3.0, intensity_multiplier))

    def step(self, dt: float = 1.0) -> TelemetryPacket:
        """
        Advance physics engine by dt seconds (scaled by speed_multiplier if running).
        Generates and returns a fully validated TelemetryPacket tagged with source='simulated'.
        """
        effective_dt = dt * self.speed_multiplier if not self.is_paused else 0.0

        if effective_dt > 0:
            self.sim_time_sec += effective_dt
            self.housekeeping.advance_time(effective_dt)

        t = self.sim_time_sec

        # 1. Evaluate Environmental Curves
        temp_curve = self.scenario_profile.get_channel("temperature")
        target_temp = temp_curve.evaluate(t) if temp_curve else 22.0

        hum_curve = self.scenario_profile.get_channel("humidity")
        target_humidity = hum_curve.evaluate(t) if hum_curve else 48.0

        press_curve = self.scenario_profile.get_channel("pressure")
        target_pressure = press_curve.evaluate(t) if press_curve else 1013.25

        # Apply intensity multiplier to environmental deviations from baseline
        if self.intensity_multiplier != 1.0:
            if temp_curve:
                target_temp = temp_curve.baseline + (target_temp - temp_curve.baseline) * self.intensity_multiplier
            if hum_curve:
                target_humidity = hum_curve.baseline + (target_humidity - hum_curve.baseline) * self.intensity_multiplier

        # Gas concentration curves
        mq2_curve = self.scenario_profile.get_channel("mq2")
        target_mq2_factor = mq2_curve.evaluate(t) if mq2_curve else 1.0

        mq7_curve = self.scenario_profile.get_channel("mq7")
        target_mq7_factor = mq7_curve.evaluate(t) if mq7_curve else 1.0

        mq135_curve = self.scenario_profile.get_channel("mq135")
        target_mq135_factor = mq135_curve.evaluate(t) if mq135_curve else 1.0

        if self.intensity_multiplier != 1.0:
            target_mq2_factor = 1.0 + (target_mq2_factor - 1.0) * self.intensity_multiplier
            target_mq7_factor = 1.0 + (target_mq7_factor - 1.0) * self.intensity_multiplier
            target_mq135_factor = 1.0 + (target_mq135_factor - 1.0) * self.intensity_multiplier

        # 2. Step BME280 Model
        bme_data = self.bme280.step(
            target_temp=target_temp,
            target_humidity=target_humidity,
            target_pressure=target_pressure,
            dt=effective_dt,
        )

        # 3. Step Gas Sensor Models
        uptime = self.housekeeping.uptime_sec
        ambient_t = bme_data["temperature_c"] if bme_data["temperature_c"] > -100 else 25.0
        ambient_h = bme_data["humidity_pct"] if bme_data["humidity_pct"] > -100 else 50.0

        mq2_data = self.mq2.step(target_mq2_factor, ambient_t, ambient_h, uptime, effective_dt)
        mq7_data = self.mq7.step(target_mq7_factor, ambient_t, ambient_h, uptime, effective_dt)
        mq135_data = self.mq135.step(target_mq135_factor, ambient_t, ambient_h, uptime, effective_dt)

        # 4. Step IR Sensor Model
        ir_curve = self.scenario_profile.get_binary_channel("ir")
        target_ir_state = ir_curve.evaluate(t) if ir_curve else 0
        flutter_prob = ir_curve.flutter_probability if ir_curve else 0.0
        ir_state = self.ir.step(target_ir_state, flutter_probability=flutter_prob)

        # 5. Evaluate Local Risk Tier & Events
        risk_result: RiskTierResult = self.event_processor.evaluate(
            sim_time_sec=t,
            temperature_c=bme_data["temperature_c"],
            humidity_pct=bme_data["humidity_pct"],
            pressure_hpa=bme_data["pressure_hpa"],
            mq2_raw=mq2_data["raw_adc"],
            mq7_raw=mq7_data["raw_adc"],
            mq135_raw=mq135_data["raw_adc"],
            ir_state=ir_state,
        )

        # 6. Assemble SensorReadings
        readings = SensorReadings(
            bme280=BME280Readings(
                temperature_c=bme_data["temperature_c"],
                humidity_pct=bme_data["humidity_pct"],
                pressure_hpa=bme_data["pressure_hpa"],
            ),
            mq2_raw=mq2_data["raw_adc"],
            mq7_raw=mq7_data["raw_adc"],
            mq135_raw=mq135_data["raw_adc"],
            ir_state=ir_state,
            battery_voltage_v=self.housekeeping.get_voltage(),
            mq2_details=GasSensorDetails(**mq2_data),
            mq7_details=GasSensorDetails(**mq7_data),
            mq135_details=GasSensorDetails(**mq135_data),
        )

        all_warmed_up = mq2_data["is_warmed_up"] and mq7_data["is_warmed_up"] and mq135_data["is_warmed_up"]
        health_status = "CRITICAL_FAULT" if risk_result.tier == "FAULT" else ("DEGRADED" if not all_warmed_up else "HEALTHY")

        device_health = DeviceHealth(
            is_connected=self.housekeeping.is_connected,
            health_status=health_status,
            uptime_sec=round(self.housekeeping.uptime_sec, 2),
            all_warmed_up=all_warmed_up,
        )

        # 7. Construct Telemetry Packet
        packet = TelemetryPacket(
            schema_version="1.1.0",
            packet_id=f"PKT-{uuid.uuid4().hex[:12].upper()}",
            session_id=self.session_id,
            device_id=self.device_id,
            sequence_number=self.housekeeping.next_sequence(),
            timestamp=datetime.now(timezone.utc),
            source="simulated",
            scenario_id=self.scenario_id,
            sim_time_sec=round(t, 2),
            readings=readings,
            device_health=device_health,
            simulated_tier=risk_result.tier,
            active_events=[e.model_dump() for e in risk_result.active_events],
        )

        # Append to circular history buffer
        self.history.append(packet)
        return packet

    def get_recent_history(self, limit: int = 50) -> List[TelemetryPacket]:
        """Returns the most recent N packets in chronological order."""
        items = list(self.history)
        return items[-limit:] if len(items) > limit else items

    def get_current_state(self) -> Dict[str, Any]:
        """Returns diagnostic operational state of the engine."""
        latest_packet = self.history[-1] if self.history else None
        return {
            "session_id": self.session_id,
            "device_id": self.device_id,
            "scenario_id": self.scenario_id,
            "sim_time_sec": round(self.sim_time_sec, 2),
            "is_running": self.is_running,
            "is_paused": self.is_paused,
            "speed_multiplier": self.speed_multiplier,
            "intensity_multiplier": self.intensity_multiplier,
            "history_count": len(self.history),
            "latest_packet": latest_packet.model_dump() if latest_packet else None,
        }

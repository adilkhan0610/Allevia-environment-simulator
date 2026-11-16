"""
ALLEVIA Local Simulation Engine Package.
Exports core numerical models, sensor models, scenario curves, and event processors.
"""

from app.simulator.math_models import (
    SeededRNG,
    ADCQuantizer,
    ExponentialFilter,
    compute_warmup_multiplier,
    compute_thermal_drift,
)
from app.simulator.sensor_models import (
    BME280Model,
    MQ2Model,
    MQ7Model,
    MQ135Model,
    IRSensorModel,
    DeviceHousekeepingModel,
)
from app.simulator.scenario_curve import (
    Keyframe,
    ChannelCurve,
    BinaryTrigger,
    BinaryChannelCurve,
    ScenarioProfile,
)
from app.simulator.scenario_profiles import SCENARIO_PROFILES
from app.simulator.event_processor import (
    SimulatedLocalEvent,
    RiskTierResult,
    LocalEventProcessor,
)
from app.simulator.engine import LocalSimulationEngine

__all__ = [
    "SeededRNG",
    "ADCQuantizer",
    "ExponentialFilter",
    "compute_warmup_multiplier",
    "compute_thermal_drift",
    "BME280Model",
    "MQ2Model",
    "MQ7Model",
    "MQ135Model",
    "IRSensorModel",
    "DeviceHousekeepingModel",
    "Keyframe",
    "ChannelCurve",
    "BinaryTrigger",
    "BinaryChannelCurve",
    "ScenarioProfile",
    "SCENARIO_PROFILES",
    "SimulatedLocalEvent",
    "RiskTierResult",
    "LocalEventProcessor",
    "LocalSimulationEngine",
]

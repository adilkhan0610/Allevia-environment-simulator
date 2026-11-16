"""
Scenario curve evaluator and keyframe interpolation.
Evaluates continuous environmental targets (temperature, humidity, pressure, gas concentration)
and binary triggers (IR beam break) as functions of simulation time t.
Supported interpolation modes: linear, exponential, step.
"""

import math
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class Keyframe(BaseModel):
    time_sec: float
    value: float
    interpolation: str = "linear"  # "linear", "exponential", "step"


class ChannelCurve(BaseModel):
    baseline: float
    noise_std_dev: float = 0.0
    keyframes: List[Keyframe] = Field(default_factory=list)

    def evaluate(self, t: float) -> float:
        if not self.keyframes:
            return self.baseline

        # Clamp before first keyframe
        if t <= self.keyframes[0].time_sec:
            return self.keyframes[0].value

        # Clamp after last keyframe
        if t >= self.keyframes[-1].time_sec:
            return self.keyframes[-1].value

        # Find enclosing keyframe segment
        for i in range(len(self.keyframes) - 1):
            k1 = self.keyframes[i]
            k2 = self.keyframes[i + 1]
            if k1.time_sec <= t <= k2.time_sec:
                duration = k2.time_sec - k1.time_sec
                if duration <= 1e-6:
                    return k2.value

                progress = (t - k1.time_sec) / duration
                interp = k2.interpolation.lower()

                if interp == "step":
                    return k2.value if t >= k2.time_sec else k1.value
                elif interp == "exponential":
                    # Smooth sigmoidal or exponential ease-in-out
                    e_prog = 0.5 * (1.0 - math.cos(progress * math.pi))
                    return k1.value + (k2.value - k1.value) * e_prog
                else:  # default "linear"
                    return k1.value + (k2.value - k1.value) * progress

        return self.baseline


class BinaryTrigger(BaseModel):
    start_sec: float
    end_sec: float
    state: int = 1


class BinaryChannelCurve(BaseModel):
    default_state: int = 0
    triggers: List[BinaryTrigger] = Field(default_factory=list)
    flutter_probability: float = 0.0

    def evaluate(self, t: float) -> int:
        for trig in self.triggers:
            if trig.start_sec <= t <= trig.end_sec:
                return trig.state
        return self.default_state


class ScenarioProfile(BaseModel):
    id: str
    slug: str
    name: str
    description: str
    duration_seconds: float = 300.0
    random_seed: int = 42
    channels: Dict[str, Any]

    def get_channel(self, name: str) -> Optional[ChannelCurve]:
        data = self.channels.get(name)
        if data and isinstance(data, dict) and "keyframes" in data:
            return ChannelCurve(**data)
        return None

    def get_binary_channel(self, name: str) -> Optional[BinaryChannelCurve]:
        data = self.channels.get(name)
        if data and isinstance(data, dict) and "triggers" in data:
            return BinaryChannelCurve(**data)
        return None

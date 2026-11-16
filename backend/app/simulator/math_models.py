"""
Mathematical models and numerical primitives for physical simulation.
- Quantized 10-bit ADC converter (Arduino Uno ATmega328P reference)
- Seeded pseudo-random Gaussian noise generator (Box-Muller / standard normal)
- Thermal baseline drift model
- First-order exponential lag filter (sensor warm-up and response dynamics)
"""

import math
import random
from typing import Optional


class SeededRNG:
    """
    Deterministic pseudo-random number generator for reproducible simulations.
    Wraps standard Python random.Random instance initialized with an integer seed.
    """

    def __init__(self, seed: Optional[int] = 42):
        self._seed = seed if seed is not None else 42
        self._rng = random.Random(self._seed)

    def reseed(self, seed: int) -> None:
        self._seed = seed
        self._rng = random.Random(seed)

    @property
    def seed(self) -> int:
        return self._seed

    def gaussian(self, mean: float = 0.0, std_dev: float = 1.0) -> float:
        """Generates zero-mean Gaussian noise N(mean, std_dev^2)."""
        if std_dev <= 0:
            return mean
        return self._rng.gauss(mean, std_dev)

    def uniform(self, low: float, high: float) -> float:
        return self._rng.uniform(low, high)


class ADCQuantizer:
    """
    Simulates the 10-bit Successive Approximation Register (SAR) ADC of the ATmega328P.
    Reference voltage Vref = 5.0 V.
    Resolution: 5.0 V / 1023 ≈ 4.8875 mV per LSB count.
    Range: 0 to 1023 integer counts.
    """

    def __init__(self, v_ref: float = 5.0, bit_depth: int = 10):
        self.v_ref = v_ref
        self.max_counts = (1 << bit_depth) - 1  # 1023 for 10-bit
        self.resolution = v_ref / self.max_counts

    def voltage_to_adc(self, voltage: float) -> int:
        """Converts analog voltage to clamped integer ADC register value (0-1023)."""
        clamped_voltage = max(0.0, min(self.v_ref, voltage))
        raw_adc = round((clamped_voltage / self.v_ref) * self.max_counts)
        return max(0, min(self.max_counts, int(raw_adc)))

    def adc_to_voltage(self, adc_count: int) -> float:
        """Converts integer ADC count back to analog voltage."""
        clamped_adc = max(0, min(self.max_counts, adc_count))
        return (clamped_adc / self.max_counts) * self.v_ref


class ExponentialFilter:
    """
    Discrete first-order low-pass filter (exponential smoothing) simulating physical lag
    and thermal time constant τ:
        y[k] = α * x[k] + (1 - α) * y[k-1]
    where α = 1 - exp(-dt / τ).
    """

    def __init__(self, tau: float, initial_value: float = 0.0):
        self.tau = max(1e-4, tau)
        self.value = initial_value

    def reset(self, initial_value: float) -> None:
        self.value = initial_value

    def update(self, target: float, dt: float) -> float:
        if dt <= 0:
            return self.value
        alpha = 1.0 - math.exp(-dt / self.tau)
        self.value = alpha * target + (1.0 - alpha) * self.value
        return self.value


def compute_warmup_multiplier(uptime_sec: float, warmup_tau_sec: float = 20.0) -> float:
    """
    Computes metal oxide sensor heater coil warm-up coefficient:
        η(t) = 1.0 - exp(-t / τ)
    Returns value in [0.0, 1.0].
    """
    if uptime_sec <= 0:
        return 0.0
    return min(1.0, max(0.0, 1.0 - math.exp(-uptime_sec / warmup_tau_sec)))


def compute_thermal_drift(
    temperature_c: float,
    reference_temp_c: float = 25.0,
    k_temp: float = 0.015
) -> float:
    """
    Computes linear temperature drift factor relative to standard 25°C baseline:
        drift = 1.0 + k_temp * (T - 25.0)
    """
    delta_t = temperature_c - reference_temp_c
    return 1.0 + k_temp * delta_t

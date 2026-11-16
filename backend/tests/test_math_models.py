"""
Unit tests for mathematical models and numerical primitives:
- Seeded pseudo-random noise reproducibility
- 10-bit ADC quantization (resolution, boundary conditions, rounding)
- Exponential smoothing filter (time constant, convergence)
- Sensor warm-up curve multiplier
- Thermal baseline drift calculation
"""

import pytest
from app.simulator.math_models import (
    SeededRNG,
    ADCQuantizer,
    ExponentialFilter,
    compute_warmup_multiplier,
    compute_thermal_drift,
)


def test_seeded_rng_reproducibility():
    """Verify that two RNG instances with the same seed generate identical sequences."""
    rng1 = SeededRNG(seed=12345)
    rng2 = SeededRNG(seed=12345)

    samples1 = [rng1.gaussian(0.0, 1.0) for _ in range(50)]
    samples2 = [rng2.gaussian(0.0, 1.0) for _ in range(50)]

    assert samples1 == samples2

    # Verify that different seeds produce different sequences
    rng3 = SeededRNG(seed=99999)
    samples3 = [rng3.gaussian(0.0, 1.0) for _ in range(50)]
    assert samples1 != samples3


def test_adc_quantizer_resolution_and_boundaries():
    """Verify 10-bit quantization behavior against ATmega328P 5V reference."""
    adc = ADCQuantizer(v_ref=5.0, bit_depth=10)

    assert adc.max_counts == 1023
    assert abs(adc.resolution - (5.0 / 1023)) < 1e-6

    # Clamping boundaries
    assert adc.voltage_to_adc(-1.0) == 0
    assert adc.voltage_to_adc(0.0) == 0
    assert adc.voltage_to_adc(5.0) == 1023
    assert adc.voltage_to_adc(6.5) == 1023

    # Intermediate known voltages
    # 2.5V should be exactly 511.5 -> rounds to 512
    assert adc.voltage_to_adc(2.5) == 512
    # Convert back to voltage
    reconstructed_v = adc.adc_to_voltage(512)
    assert abs(reconstructed_v - 2.5024) < 0.01


def test_exponential_filter_lag_and_convergence():
    """Verify first-order exponential smoothing behaves as a low-pass lag filter."""
    tau = 5.0
    filt = ExponentialFilter(tau=tau, initial_value=20.0)

    # Step response toward 40.0 with dt = 1.0
    values = []
    for _ in range(30):
        val = filt.update(target=40.0, dt=1.0)
        values.append(val)

    # Values should strictly increase towards 40.0 without overshoot
    for i in range(len(values) - 1):
        assert values[i] < values[i + 1]

    # After ~5*tau (25 seconds), it should be within 1% of the target
    assert abs(values[-1] - 40.0) < 0.5


def test_warmup_multiplier():
    """Verify heater warm-up coefficient progresses asymptotically from 0 to 1."""
    tau = 10.0
    assert compute_warmup_multiplier(uptime_sec=0.0, warmup_tau_sec=tau) == 0.0

    # At t = tau, 1 - 1/e ≈ 0.632
    val_at_tau = compute_warmup_multiplier(uptime_sec=10.0, warmup_tau_sec=tau)
    assert 0.62 < val_at_tau < 0.64

    # At t = 4*tau (40s), warm-up should be > 0.98
    val_at_4tau = compute_warmup_multiplier(uptime_sec=40.0, warmup_tau_sec=tau)
    assert val_at_4tau > 0.98


def test_thermal_drift():
    """Verify thermal drift increases sensitivity with rising temperature."""
    # At 25°C, factor is exactly 1.0
    assert compute_thermal_drift(25.0, reference_temp_c=25.0) == 1.0

    # At 45°C (+20°C rise), factor increases
    drift_high = compute_thermal_drift(45.0, reference_temp_c=25.0, k_temp=0.01)
    assert drift_high == 1.20

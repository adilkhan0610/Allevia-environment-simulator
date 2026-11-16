"""
Unit tests for physical sensor models:
- BME280 temperature, humidity, pressure response and noise
- MQ-2 smoke/combustible gas response, warm-up, noise, and recovery
- MQ-7 carbon monoxide response and recovery dynamics
- MQ-135 air quality response
- IR digital optical beam-break sensor states
- Device housekeeping, sequence counter, and simulated voltage ripple
- Sensor fault injection (I2C drop, open-circuit pull-up, erratic states)
"""

import pytest
from app.simulator.math_models import SeededRNG, ADCQuantizer
from app.simulator.sensor_models import (
    BME280Model,
    MQ2Model,
    MQ7Model,
    MQ135Model,
    IRSensorModel,
    DeviceHousekeepingModel,
)


@pytest.fixture
def rng():
    return SeededRNG(seed=42)


@pytest.fixture
def adc():
    return ADCQuantizer(v_ref=5.0, bit_depth=10)


def test_bme280_nominal_step_and_noise(rng):
    bme = BME280Model(rng=rng, baseline_temp=22.0, baseline_humidity=45.0, baseline_pressure=1013.25)
    
    # Step at steady conditions
    data = bme.step(target_temp=22.0, target_humidity=45.0, target_pressure=1013.25, dt=1.0)
    assert 20.0 < data["temperature_c"] < 24.0
    assert 40.0 < data["humidity_pct"] < 50.0
    assert 1010.0 < data["pressure_hpa"] < 1016.0


def test_bme280_fault_injection(rng):
    bme = BME280Model(rng=rng)
    bme.set_fault("i2c_disconnect")
    data = bme.step(25.0, 50.0, 1013.0, dt=1.0)
    assert data["temperature_c"] == -999.0
    assert data["humidity_pct"] == -999.0


def test_mq2_warmup_and_smoke_response(rng, adc):
    mq2 = MQ2Model(rng=rng, adc=adc)
    
    # During initial warm-up (uptime = 0s)
    res_cold = mq2.step(target_concentration_factor=1.0, ambient_temp_c=25.0, ambient_humidity_pct=50.0, uptime_sec=0.0, dt=1.0)
    assert not res_cold["is_warmed_up"]
    assert 0 <= res_cold["raw_adc"] <= 1023

    # Fast forward uptime to fully warmed state (uptime = 40s)
    res_warm = mq2.step(target_concentration_factor=1.0, ambient_temp_c=25.0, ambient_humidity_pct=50.0, uptime_sec=40.0, dt=1.0)
    assert res_warm["is_warmed_up"]
    # Baseline ADC count should be near ~125
    assert 100 <= res_warm["raw_adc"] <= 150

    # Simulate heavy smoke exposure (concentration factor = 8.0) over 20 seconds
    for _ in range(20):
        res_smoke = mq2.step(target_concentration_factor=8.0, ambient_temp_c=25.0, ambient_humidity_pct=50.0, uptime_sec=60.0, dt=1.0)
    
    # Smoke should have driven ADC count significantly upward (> 550)
    assert res_smoke["raw_adc"] > 550
    assert res_smoke["voltage_v"] > 2.5

    # Test recovery when concentration returns to clean air (1.0)
    for _ in range(30):
        res_recovered = mq2.step(target_concentration_factor=1.0, ambient_temp_c=25.0, ambient_humidity_pct=50.0, uptime_sec=100.0, dt=1.0)
    # ADC should recover downward
    assert res_recovered["raw_adc"] < res_smoke["raw_adc"]


def test_mq7_co_response_and_fault(rng, adc):
    mq7 = MQ7Model(rng=rng, adc=adc)

    # Warm-up baseline
    res = mq7.step(target_concentration_factor=1.0, ambient_temp_c=25.0, ambient_humidity_pct=50.0, uptime_sec=45.0, dt=1.0)
    assert 70 <= res["raw_adc"] <= 120

    # Inject open circuit fault
    mq7.set_fault("open_circuit")
    res_fault = mq7.step(1.0, 25.0, 50.0, 46.0, 1.0)
    assert res_fault["raw_adc"] == 1023
    assert res_fault["voltage_v"] == 5.0


def test_mq135_air_quality_response(rng, adc):
    mq135 = MQ135Model(rng=rng, adc=adc)
    res = mq135.step(target_concentration_factor=1.0, ambient_temp_c=25.0, ambient_humidity_pct=50.0, uptime_sec=40.0, dt=1.0)
    assert 120 <= res["raw_adc"] <= 180

    # Degraded air quality
    for _ in range(15):
        res_degraded = mq135.step(target_concentration_factor=5.0, ambient_temp_c=25.0, ambient_humidity_pct=50.0, uptime_sec=60.0, dt=1.0)
    assert res_degraded["raw_adc"] > 400


def test_ir_sensor_digital_state_and_fault(rng):
    ir = IRSensorModel(rng=rng)
    # Default clear path
    assert ir.step(target_state=0) == 0
    # Obstructed beam
    assert ir.step(target_state=1) == 1

    # Fault stuck on
    ir.set_fault("stuck_on")
    assert ir.step(target_state=0) == 1


def test_device_housekeeping(rng):
    hk = DeviceHousekeepingModel(rng=rng)
    assert hk.uptime_sec == 0.0
    assert hk.next_sequence() == 0
    assert hk.next_sequence() == 1
    assert hk.next_sequence() == 2

    # Voltage stays near 5.0V with small ripple
    v = hk.get_voltage()
    assert 4.85 <= v <= 5.15

    hk.advance_time(5.5)
    assert hk.uptime_sec == 5.5

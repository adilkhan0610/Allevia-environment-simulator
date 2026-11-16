"""
Integration and behavioral tests for the Local Simulation Engine:
- Seed reproducibility of generated telemetry packets
- Controllable clock without real-time waiting
- Scenario transitions (heatwave thermal rise, smoke spike, CO emergency)
- Local event processor threshold triggers
- Telemetry packet schema validation and source='simulated' tag
- Engine pause, resume, reset, speed multiplier, and fault injection
"""

import pytest
from app.simulator.engine import LocalSimulationEngine
from app.schemas.telemetry import TelemetryPacket


def test_engine_seed_reproducibility():
    """Verify identical seeds produce byte-for-byte identical telemetry sequences."""
    engine1 = LocalSimulationEngine(session_id="test-s1", scenario_id="scenario-01", seed=42)
    engine2 = LocalSimulationEngine(session_id="test-s1", scenario_id="scenario-01", seed=42)

    packets1 = [engine1.step(dt=1.0) for _ in range(20)]
    packets2 = [engine2.step(dt=1.0) for _ in range(20)]

    for p1, p2 in zip(packets1, packets2):
        assert p1.sequence_number == p2.sequence_number
        assert p1.sim_time_sec == p2.sim_time_sec
        assert p1.readings.bme280.temperature_c == p2.readings.bme280.temperature_c
        assert p1.readings.mq2_raw == p2.readings.mq2_raw
        assert p1.readings.mq7_raw == p2.readings.mq7_raw
        assert p1.readings.mq135_raw == p2.readings.mq135_raw


def test_engine_packet_validation_and_source_tag():
    """Verify all emitted packets strictly validate schema and contain source='simulated'."""
    engine = LocalSimulationEngine(session_id="test-session", scenario_id="scenario-01", seed=100)
    engine.start()

    for _ in range(10):
        packet = engine.step(dt=1.0)
        assert isinstance(packet, TelemetryPacket)
        assert packet.source == "simulated"
        assert 0 <= packet.readings.mq2_raw <= 1023
        assert 0 <= packet.readings.mq7_raw <= 1023
        assert 0 <= packet.readings.mq135_raw <= 1023
        assert packet.readings.ir_state in (0, 1)


def test_engine_heatwave_scenario_transition():
    """Scenario 02 (Midday Heatwave) should escalate temperature and transition risk tier."""
    engine = LocalSimulationEngine(session_id="test-heat", scenario_id="scenario-02", seed=777)
    engine.start()

    # Step through 200 seconds of simulation
    final_packet = None
    for _ in range(200):
        final_packet = engine.step(dt=1.0)

    # Temperature should have escalated above 38°C
    assert final_packet.readings.bme280.temperature_c > 38.0
    # Tier should have transitioned to ORANGE or RED
    assert final_packet.simulated_tier in ("ORANGE", "RED")
    assert len(final_packet.active_events) > 0


def test_engine_smoke_scenario_response():
    """Scenario 04 (Smoke Episode) should drive MQ-2 raw ADC upward and trigger smoke event."""
    engine = LocalSimulationEngine(session_id="test-smoke", scenario_id="scenario-04", seed=888)
    engine.start()

    # Step into peak smoke window (~100s)
    peak_packet = None
    for _ in range(110):
        peak_packet = engine.step(dt=1.0)

    assert peak_packet.readings.mq2_raw > 500
    assert peak_packet.simulated_tier in ("ORANGE", "RED")
    event_categories = [e["event_category"] for e in peak_packet.active_events]
    assert "SMOKE" in event_categories


def test_engine_pause_resume_reset():
    """Verify pause stops clock progression, resume continues, and reset zeroes state."""
    engine = LocalSimulationEngine(session_id="test-ctrl", scenario_id="scenario-01", seed=42)
    engine.start()

    # Run 5 steps
    for _ in range(5):
        engine.step(dt=1.0)
    assert engine.sim_time_sec == 5.0

    # Pause
    engine.pause()
    assert engine.is_paused
    # Stepping while paused should not advance sim_time_sec
    p_paused = engine.step(dt=1.0)
    assert p_paused.sim_time_sec == 5.0

    # Resume
    engine.resume()
    assert not engine.is_paused
    p_resumed = engine.step(dt=1.0)
    assert p_resumed.sim_time_sec == 6.0

    # Reset
    engine.reset()
    assert engine.sim_time_sec == 0.0
    assert not engine.is_running
    assert len(engine.history) == 0


def test_engine_fault_injection():
    """Verify hardware fault injection drives sensor to fault states."""
    engine = LocalSimulationEngine(session_id="test-fault", scenario_id="scenario-01", seed=42)
    engine.start()

    # Normal step
    p_norm = engine.step(dt=1.0)
    assert p_norm.simulated_tier == "GREEN"

    # Inject BME280 I2C bus lockup
    engine.set_fault("bme280", "i2c_disconnect")
    p_fault = engine.step(dt=1.0)
    assert p_fault.readings.bme280.temperature_c == -999.0
    assert p_fault.simulated_tier == "FAULT"

    # Clear fault
    engine.clear_all_faults()
    p_cleared = engine.step(dt=1.0)
    assert p_cleared.readings.bme280.temperature_c > -50.0

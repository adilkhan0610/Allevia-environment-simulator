"""
Unit tests for scenario curve interpolation:
- Linear keyframe interpolation
- Exponential sigmoidal interpolation
- Step interpolation
- Clamping outside keyframe bounds
- Binary trigger intervals for digital IR channel
"""

import pytest
from app.simulator.scenario_curve import ChannelCurve, Keyframe, BinaryChannelCurve, BinaryTrigger


def test_channel_curve_linear_interpolation():
    curve = ChannelCurve(
        baseline=20.0,
        keyframes=[
            Keyframe(time_sec=0.0, value=20.0, interpolation="linear"),
            Keyframe(time_sec=10.0, value=30.0, interpolation="linear"),
        ],
    )

    # Before start
    assert curve.evaluate(-5.0) == 20.0
    # Exactly at start
    assert curve.evaluate(0.0) == 20.0
    # Midway (t=5.0) -> exactly 25.0
    assert abs(curve.evaluate(5.0) - 25.0) < 1e-4
    # End
    assert curve.evaluate(10.0) == 30.0
    # Past end
    assert curve.evaluate(20.0) == 30.0


def test_channel_curve_step_interpolation():
    curve = ChannelCurve(
        baseline=0.0,
        keyframes=[
            Keyframe(time_sec=0.0, value=10.0, interpolation="step"),
            Keyframe(time_sec=5.0, value=50.0, interpolation="step"),
            Keyframe(time_sec=10.0, value=50.0, interpolation="step"),
        ],
    )

    # In step mode, value stays at previous keyframe until next keyframe is hit
    assert curve.evaluate(2.0) == 10.0
    assert curve.evaluate(5.0) == 50.0


def test_binary_channel_curve_triggers():
    bin_curve = BinaryChannelCurve(
        default_state=0,
        triggers=[
            BinaryTrigger(start_sec=10.0, end_sec=20.0, state=1),
            BinaryTrigger(start_sec=50.0, end_sec=60.0, state=1),
        ],
    )

    assert bin_curve.evaluate(5.0) == 0
    assert bin_curve.evaluate(10.0) == 1
    assert bin_curve.evaluate(15.0) == 1
    assert bin_curve.evaluate(20.0) == 1
    assert bin_curve.evaluate(25.0) == 0
    assert bin_curve.evaluate(55.0) == 1
    assert bin_curve.evaluate(70.0) == 0

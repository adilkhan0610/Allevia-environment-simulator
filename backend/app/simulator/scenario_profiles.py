"""
Default detailed mathematical scenario curve definitions for all 6 scenarios:
1. Normal Day (Baseline workplace)
2. Midday Heatwave (Thermal stress spike)
3. Humid Heat (Wet-bulb high humidity thermal stress)
4. Smoke or Dust Episode (Particulate/fire advisory)
5. Gas Leak (Toxic CO and flammable gas emergency demo)
6. Sensor Fault (Diagnostic line breaks, I2C bus error, stuck bits)
"""

from typing import Dict, Any

SCENARIO_PROFILES: Dict[str, Dict[str, Any]] = {
    "scenario-01": {
        "id": "scenario-01",
        "slug": "normal-day",
        "name": "Normal Day",
        "description": "Baseline workplace environment with gentle diurnal temperature and humidity fluctuations. All air quality metrics remain in clean safe bands.",
        "duration_seconds": 300.0,
        "random_seed": 1001,
        "channels": {
            "temperature": {
                "baseline": 22.0,
                "noise_std_dev": 0.12,
                "keyframes": [
                    {"time_sec": 0.0, "value": 22.0, "interpolation": "linear"},
                    {"time_sec": 75.0, "value": 22.8, "interpolation": "linear"},
                    {"time_sec": 150.0, "value": 23.5, "interpolation": "linear"},
                    {"time_sec": 225.0, "value": 22.9, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 22.1, "interpolation": "linear"},
                ],
            },
            "humidity": {
                "baseline": 48.0,
                "noise_std_dev": 0.5,
                "keyframes": [
                    {"time_sec": 0.0, "value": 48.0, "interpolation": "linear"},
                    {"time_sec": 150.0, "value": 52.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 47.5, "interpolation": "linear"},
                ],
            },
            "pressure": {
                "baseline": 1013.25,
                "noise_std_dev": 0.25,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1013.25, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1013.10, "interpolation": "linear"},
                ],
            },
            "mq2": {
                "baseline": 1.0,  # 1.0 = clean baseline
                "noise_std_dev": 3.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1.0, "interpolation": "linear"},
                ],
            },
            "mq7": {
                "baseline": 1.0,
                "noise_std_dev": 3.5,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1.0, "interpolation": "linear"},
                ],
            },
            "mq135": {
                "baseline": 1.0,
                "noise_std_dev": 4.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1.05, "interpolation": "linear"},
                ],
            },
            "ir": {
                "default_state": 0,
                "triggers": [],
                "flutter_probability": 0.0,
            },
        },
    },
    "scenario-02": {
        "id": "scenario-02",
        "slug": "midday-heatwave",
        "name": "Midday Heatwave",
        "description": "Rapid escalation in ambient temperature up to 43.5°C accompanied by dry air (humidity dropping to 20%), triggering heat strain tier transitions.",
        "duration_seconds": 300.0,
        "random_seed": 1002,
        "channels": {
            "temperature": {
                "baseline": 25.0,
                "noise_std_dev": 0.15,
                "keyframes": [
                    {"time_sec": 0.0, "value": 25.0, "interpolation": "linear"},
                    {"time_sec": 30.0, "value": 28.0, "interpolation": "linear"},
                    {"time_sec": 80.0, "value": 33.5, "interpolation": "exponential"},  # YELLOW
                    {"time_sec": 140.0, "value": 38.5, "interpolation": "exponential"},  # ORANGE
                    {"time_sec": 200.0, "value": 43.5, "interpolation": "exponential"},  # RED
                    {"time_sec": 260.0, "value": 44.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 43.0, "interpolation": "linear"},
                ],
            },
            "humidity": {
                "baseline": 45.0,
                "noise_std_dev": 0.6,
                "keyframes": [
                    {"time_sec": 0.0, "value": 45.0, "interpolation": "linear"},
                    {"time_sec": 60.0, "value": 38.0, "interpolation": "linear"},
                    {"time_sec": 160.0, "value": 26.0, "interpolation": "exponential"},
                    {"time_sec": 240.0, "value": 19.5, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 19.0, "interpolation": "linear"},
                ],
            },
            "pressure": {
                "baseline": 1012.0,
                "noise_std_dev": 0.3,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1012.0, "interpolation": "linear"},
                    {"time_sec": 200.0, "value": 1007.5, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1007.0, "interpolation": "linear"},
                ],
            },
            "mq2": {
                "baseline": 1.0,
                "noise_std_dev": 3.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1.1, "interpolation": "linear"},  # slight thermal drift
                ],
            },
            "mq7": {
                "baseline": 1.0,
                "noise_std_dev": 3.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1.08, "interpolation": "linear"},
                ],
            },
            "mq135": {
                "baseline": 1.0,
                "noise_std_dev": 3.5,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1.12, "interpolation": "linear"},
                ],
            },
            "ir": {
                "default_state": 0,
                "triggers": [],
                "flutter_probability": 0.0,
            },
        },
    },
    "scenario-03": {
        "id": "scenario-03",
        "slug": "humid-heat",
        "name": "Humid Heat",
        "description": "Dangerous combined heat and high humidity condition (35°C at 90% RH) causing rapid heat index escalation where evaporative cooling fails.",
        "duration_seconds": 300.0,
        "random_seed": 1003,
        "channels": {
            "temperature": {
                "baseline": 26.0,
                "noise_std_dev": 0.12,
                "keyframes": [
                    {"time_sec": 0.0, "value": 26.0, "interpolation": "linear"},
                    {"time_sec": 60.0, "value": 30.0, "interpolation": "linear"},
                    {"time_sec": 120.0, "value": 34.0, "interpolation": "exponential"},
                    {"time_sec": 180.0, "value": 36.2, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 35.8, "interpolation": "linear"},
                ],
            },
            "humidity": {
                "baseline": 55.0,
                "noise_std_dev": 0.7,
                "keyframes": [
                    {"time_sec": 0.0, "value": 55.0, "interpolation": "linear"},
                    {"time_sec": 50.0, "value": 68.0, "interpolation": "linear"},
                    {"time_sec": 110.0, "value": 85.0, "interpolation": "exponential"},
                    {"time_sec": 170.0, "value": 92.5, "interpolation": "exponential"},
                    {"time_sec": 300.0, "value": 94.0, "interpolation": "linear"},
                ],
            },
            "pressure": {
                "baseline": 1009.0,
                "noise_std_dev": 0.25,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1009.0, "interpolation": "linear"},
                    {"time_sec": 180.0, "value": 1004.5, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1004.0, "interpolation": "linear"},
                ],
            },
            "mq2": {
                "baseline": 1.0,
                "noise_std_dev": 3.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1.15, "interpolation": "linear"},
                ],
            },
            "mq7": {
                "baseline": 1.0,
                "noise_std_dev": 3.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1.12, "interpolation": "linear"},
                ],
            },
            "mq135": {
                "baseline": 1.0,
                "noise_std_dev": 3.5,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1.25, "interpolation": "linear"},
                ],
            },
            "ir": {
                "default_state": 0,
                "triggers": [],
                "flutter_probability": 0.0,
            },
        },
    },
    "scenario-04": {
        "id": "scenario-04",
        "slug": "smoke-dust-episode",
        "name": "Smoke or Dust Episode",
        "description": "Sudden localized smoke infiltration and suspended particulate event driving sharp MQ-2 and MQ-135 spikes and intermittent optical beam breaks.",
        "duration_seconds": 300.0,
        "random_seed": 1004,
        "channels": {
            "temperature": {
                "baseline": 23.0,
                "noise_std_dev": 0.15,
                "keyframes": [
                    {"time_sec": 0.0, "value": 23.0, "interpolation": "linear"},
                    {"time_sec": 80.0, "value": 24.5, "interpolation": "linear"},
                    {"time_sec": 140.0, "value": 26.5, "interpolation": "linear"},  # localized combustion warming
                    {"time_sec": 220.0, "value": 25.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 23.8, "interpolation": "linear"},
                ],
            },
            "humidity": {
                "baseline": 46.0,
                "noise_std_dev": 0.5,
                "keyframes": [
                    {"time_sec": 0.0, "value": 46.0, "interpolation": "linear"},
                    {"time_sec": 120.0, "value": 39.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 43.0, "interpolation": "linear"},
                ],
            },
            "pressure": {
                "baseline": 1013.0,
                "noise_std_dev": 0.2,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1013.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1012.8, "interpolation": "linear"},
                ],
            },
            "mq2": {
                "baseline": 1.0,
                "noise_std_dev": 4.5,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 30.0, "value": 1.1, "interpolation": "linear"},
                    {"time_sec": 60.0, "value": 3.8, "interpolation": "exponential"},  # onset
                    {"time_sec": 100.0, "value": 7.5, "interpolation": "exponential"}, # peak smoke (ADC > 700)
                    {"time_sec": 180.0, "value": 6.8, "interpolation": "linear"},
                    {"time_sec": 240.0, "value": 3.5, "interpolation": "exponential"}, # ventilation recovery
                    {"time_sec": 300.0, "value": 1.8, "interpolation": "linear"},
                ],
            },
            "mq7": {
                "baseline": 1.0,
                "noise_std_dev": 3.5,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 60.0, "value": 1.2, "interpolation": "linear"},
                    {"time_sec": 110.0, "value": 2.8, "interpolation": "exponential"}, # secondary CO from incomplete burning
                    {"time_sec": 200.0, "value": 2.2, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1.4, "interpolation": "linear"},
                ],
            },
            "mq135": {
                "baseline": 1.0,
                "noise_std_dev": 4.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 60.0, "value": 2.5, "interpolation": "exponential"},
                    {"time_sec": 110.0, "value": 6.0, "interpolation": "exponential"}, # high air quality degradation
                    {"time_sec": 210.0, "value": 4.5, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 2.0, "interpolation": "linear"},
                ],
            },
            "ir": {
                "default_state": 0,
                "triggers": [
                    {"start_sec": 70.0, "end_sec": 160.0, "state": 1},
                ],
                "flutter_probability": 0.15,
            },
        },
    },
    "scenario-05": {
        "id": "scenario-05",
        "slug": "gas-leak",
        "name": "Gas Leak (Emergency Demo)",
        "description": "Simulated industrial gas leak demonstration featuring steep exponential Carbon Monoxide (MQ-7) spike accompanied by combustible hydrocarbon (MQ-2) response.",
        "duration_seconds": 300.0,
        "random_seed": 1005,
        "channels": {
            "temperature": {
                "baseline": 22.5,
                "noise_std_dev": 0.12,
                "keyframes": [
                    {"time_sec": 0.0, "value": 22.5, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 22.7, "interpolation": "linear"},
                ],
            },
            "humidity": {
                "baseline": 47.0,
                "noise_std_dev": 0.5,
                "keyframes": [
                    {"time_sec": 0.0, "value": 47.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 46.5, "interpolation": "linear"},
                ],
            },
            "pressure": {
                "baseline": 1013.25,
                "noise_std_dev": 0.25,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1013.25, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1013.15, "interpolation": "linear"},
                ],
            },
            "mq2": {
                "baseline": 1.0,
                "noise_std_dev": 4.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 40.0, "value": 1.2, "interpolation": "linear"},
                    {"time_sec": 80.0, "value": 4.2, "interpolation": "exponential"}, # combustible secondary
                    {"time_sec": 150.0, "value": 6.5, "interpolation": "exponential"},
                    {"time_sec": 240.0, "value": 6.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 4.5, "interpolation": "linear"},
                ],
            },
            "mq7": {
                "baseline": 1.0,
                "noise_std_dev": 5.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 30.0, "value": 1.4, "interpolation": "linear"},
                    {"time_sec": 65.0, "value": 5.0, "interpolation": "exponential"}, # massive CO leak onset
                    {"time_sec": 110.0, "value": 9.2, "interpolation": "exponential"}, # peak critical hazard (ADC > 850)
                    {"time_sec": 220.0, "value": 8.8, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 6.5, "interpolation": "linear"},
                ],
            },
            "mq135": {
                "baseline": 1.0,
                "noise_std_dev": 4.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 60.0, "value": 2.2, "interpolation": "exponential"},
                    {"time_sec": 120.0, "value": 5.2, "interpolation": "exponential"},
                    {"time_sec": 300.0, "value": 4.0, "interpolation": "linear"},
                ],
            },
            "ir": {
                "default_state": 0,
                "triggers": [],
                "flutter_probability": 0.0,
            },
        },
    },
    "scenario-06": {
        "id": "scenario-06",
        "slug": "sensor-fault",
        "name": "Sensor Fault & Diagnostics",
        "description": "Simulates hardware malfunctions, I2C bus lockup on BME280, open-circuit rail on MQ-7, erratic stepped transitions, and stuck IR sensor flag.",
        "duration_seconds": 300.0,
        "random_seed": 1006,
        "channels": {
            "temperature": {
                "baseline": 22.0,
                "noise_std_dev": 0.1,
                "keyframes": [
                    {"time_sec": 0.0, "value": 22.0, "interpolation": "linear"},
                    {"time_sec": 50.0, "value": 22.2, "interpolation": "linear"},
                    {"time_sec": 51.0, "value": -999.0, "interpolation": "step"}, # I2C drop out
                    {"time_sec": 300.0, "value": -999.0, "interpolation": "step"},
                ],
            },
            "humidity": {
                "baseline": 48.0,
                "noise_std_dev": 0.5,
                "keyframes": [
                    {"time_sec": 0.0, "value": 48.0, "interpolation": "linear"},
                    {"time_sec": 50.0, "value": 48.0, "interpolation": "linear"},
                    {"time_sec": 51.0, "value": -999.0, "interpolation": "step"},
                    {"time_sec": 300.0, "value": -999.0, "interpolation": "step"},
                ],
            },
            "pressure": {
                "baseline": 1013.25,
                "noise_std_dev": 0.25,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1013.25, "interpolation": "linear"},
                    {"time_sec": 50.0, "value": 1013.25, "interpolation": "linear"},
                    {"time_sec": 51.0, "value": -999.0, "interpolation": "step"},
                    {"time_sec": 300.0, "value": -999.0, "interpolation": "step"},
                ],
            },
            "mq2": {
                "baseline": 1.0,
                "noise_std_dev": 15.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 40.0, "value": 8.0, "interpolation": "step"}, # erratic step fault
                    {"time_sec": 70.0, "value": 0.5, "interpolation": "step"},
                    {"time_sec": 110.0, "value": 9.5, "interpolation": "step"},
                    {"time_sec": 160.0, "value": 1.2, "interpolation": "step"},
                    {"time_sec": 300.0, "value": 7.0, "interpolation": "step"},
                ],
            },
            "mq7": {
                "baseline": 1.0,
                "noise_std_dev": 2.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 60.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 61.0, "value": 12.0, "interpolation": "step"}, # railed to 1023 (open circuit)
                    {"time_sec": 300.0, "value": 12.0, "interpolation": "step"},
                ],
            },
            "mq135": {
                "baseline": 1.0,
                "noise_std_dev": 4.0,
                "keyframes": [
                    {"time_sec": 0.0, "value": 1.0, "interpolation": "linear"},
                    {"time_sec": 300.0, "value": 1.0, "interpolation": "linear"},
                ],
            },
            "ir": {
                "default_state": 0,
                "triggers": [
                    {"start_sec": 35.0, "end_sec": 300.0, "state": 1}, # permanently stuck high
                ],
                "flutter_probability": 0.0,
            },
        },
    },
}

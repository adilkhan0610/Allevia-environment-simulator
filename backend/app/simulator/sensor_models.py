"""
Physical sensor models for the ALLEVIA Detector Box.
Models:
1. BME280: Digital environmental sensor (I2C) - Temperature, Relative Humidity, Pressure
2. MQ-2: Analog gas sensor (A0) - Smoke & Combustible Gas
3. MQ-7: Analog gas sensor (A1) - Carbon Monoxide (CO)
4. MQ-135: Analog gas sensor (A2) - Air Quality & Volatile Organic Compounds
5. IRSensor: Digital optical obstacle/dust event sensor (D2)
6. DeviceHousekeeping: Supply voltage, uptime, sequence counter, connection state, warm-up status

IMPORTANT SCIENTIFIC LIMITATION NOTICE:
MQ series sensor analog ADC readings represent raw relative voltage levels from the internal
voltage divider. They are NOT certified parts-per-million (ppm) measurements unless a calibrated
reference chamber curve is established. They are labeled as simulated raw relative readings.
"""

import math
from typing import Optional, Dict, Any
from app.simulator.math_models import (
    SeededRNG,
    ADCQuantizer,
    ExponentialFilter,
    compute_warmup_multiplier,
    compute_thermal_drift,
)


class BME280Model:
    """
    Simulates the Bosch Sensortec BME280 digital I2C sensor.
    Outputs:
    - temperature_c: °C (typical precision 0.01 °C, noise σ ≈ 0.15 °C)
    - humidity_pct: % (typical precision 0.01 %, noise σ ≈ 0.8 %)
    - pressure_hpa: hPa (typical precision 0.18 hPa, noise σ ≈ 0.35 hPa)
    """

    def __init__(
        self,
        rng: SeededRNG,
        baseline_temp: float = 23.5,
        baseline_humidity: float = 48.0,
        baseline_pressure: float = 1013.25,
        temp_tau: float = 8.0,
        humidity_tau: float = 10.0,
    ):
        self.rng = rng
        self.temp_filter = ExponentialFilter(tau=temp_tau, initial_value=baseline_temp)
        self.humidity_filter = ExponentialFilter(tau=humidity_tau, initial_value=baseline_humidity)
        self.pressure_hpa = baseline_pressure
        self.fault_mode: Optional[str] = None  # None, "i2c_disconnect", "stuck_low", "stuck_high"

    def reset(self, temp: float = 23.5, humidity: float = 48.0, pressure: float = 1013.25) -> None:
        self.temp_filter.reset(temp)
        self.humidity_filter.reset(humidity)
        self.pressure_hpa = pressure
        self.fault_mode = None

    def set_fault(self, fault: Optional[str]) -> None:
        self.fault_mode = fault

    def step(self, target_temp: float, target_humidity: float, target_pressure: float, dt: float) -> Dict[str, float]:
        if self.fault_mode == "i2c_disconnect":
            # Hardware I2C bus error / lockup represented as -999.0 dropout code
            return {"temperature_c": -999.0, "humidity_pct": -999.0, "pressure_hpa": -999.0}
        if self.fault_mode == "stuck_high":
            return {"temperature_c": 85.0, "humidity_pct": 100.0, "pressure_hpa": 1100.0}

        # Filtered physical response (lag)
        smooth_temp = self.temp_filter.update(target_temp, dt)
        smooth_humidity = self.humidity_filter.update(target_humidity, dt)
        self.pressure_hpa = target_pressure

        # Add Gaussian sensor measurement noise
        noise_t = self.rng.gaussian(0.0, 0.12)
        noise_h = self.rng.gaussian(0.0, 0.6)
        noise_p = self.rng.gaussian(0.0, 0.25)

        noisy_temp = max(-40.0, min(85.0, round(smooth_temp + noise_t, 2)))
        noisy_humidity = max(0.0, min(100.0, round(smooth_humidity + noise_h, 2)))
        noisy_pressure = max(300.0, min(1100.0, round(self.pressure_hpa + noise_p, 2)))

        return {
            "temperature_c": noisy_temp,
            "humidity_pct": noisy_humidity,
            "pressure_hpa": noisy_pressure,
        }


class MQGasSensorModel:
    """
    Base class for SnO2 metal-oxide semiconductor (MOS) gas sensors (MQ-2, MQ-7, MQ-135).
    Features:
    - Internal heater warm-up transient (exponential rise to stable sensitivity)
    - Non-linear voltage divider with load resistance R_L = 10 kΩ
    - 10-bit ADC quantization (0-1023 counts)
    - Thermal and humidity cross-sensitivity drift
    - Delayed response (time constant τ_response) and asymmetric recovery (τ_recovery)
    - Fault injection: open_circuit (ADC=1023), short_circuit (ADC=0), erratic noise
    """

    def __init__(
        self,
        name: str,
        analog_pin: str,
        rng: SeededRNG,
        adc: ADCQuantizer,
        baseline_adc: int,
        noise_std_dev: float = 3.5,
        tau_response: float = 6.0,
        tau_recovery: float = 14.0,
        warmup_duration_sec: float = 30.0,
        v_c: float = 5.0,
        r_l_kohm: float = 10.0,
    ):
        self.name = name
        self.analog_pin = analog_pin
        self.rng = rng
        self.adc = adc
        self.baseline_adc = baseline_adc
        self.noise_std_dev = noise_std_dev
        self.tau_response = tau_response
        self.tau_recovery = tau_recovery
        self.warmup_duration_sec = warmup_duration_sec
        self.v_c = v_c
        self.r_l_kohm = r_l_kohm

        # Initial state
        self.current_raw_adc = float(baseline_adc)
        self.fault_mode: Optional[str] = None

    def reset(self, baseline_adc: Optional[int] = None) -> None:
        if baseline_adc is not None:
            self.baseline_adc = baseline_adc
        self.current_raw_adc = float(self.baseline_adc)
        self.fault_mode = None

    def set_fault(self, fault: Optional[str]) -> None:
        self.fault_mode = fault

    def step(
        self,
        target_concentration_factor: float,
        ambient_temp_c: float,
        ambient_humidity_pct: float,
        uptime_sec: float,
        dt: float,
    ) -> Dict[str, Any]:
        """
        Step simulation forward by dt seconds.
        target_concentration_factor: 1.0 = clean baseline air; >1.0 = elevated gas presence.
        """
        # Check active hardware fault
        if self.fault_mode == "open_circuit":
            return {
                "raw_adc": 1023,
                "voltage_v": round(self.adc.adc_to_voltage(1023), 3),
                "normalized_ratio": 1.0,
                "is_warmed_up": True,
            }
        if self.fault_mode == "short_circuit":
            return {
                "raw_adc": 0,
                "voltage_v": 0.0,
                "normalized_ratio": 0.0,
                "is_warmed_up": True,
            }
        if self.fault_mode == "erratic":
            erratic_adc = self.rng.uniform(50.0, 950.0)
            quantized = self.adc.voltage_to_adc(self.adc.adc_to_voltage(int(erratic_adc)))
            return {
                "raw_adc": quantized,
                "voltage_v": round(self.adc.adc_to_voltage(quantized), 3),
                "normalized_ratio": round(quantized / 1023.0, 3),
                "is_warmed_up": True,
            }

        # 1. Warm-up coefficient
        warmup_mult = compute_warmup_multiplier(uptime_sec, self.warmup_duration_sec / 3.0)
        is_warmed_up = uptime_sec >= self.warmup_duration_sec

        # 2. Environmental cross-sensitivity drift
        # Heat reduces resistance (increases ADC); high humidity also increases conductivity
        thermal_factor = compute_thermal_drift(ambient_temp_c, reference_temp_c=25.0, k_temp=0.008)
        humidity_factor = 1.0 + 0.003 * (ambient_humidity_pct - 50.0)

        # Baseline ADC shifted by environmental factors
        effective_baseline = self.baseline_adc * thermal_factor * humidity_factor

        # During warm-up, initial resistance is high, so ADC is slightly depressed
        effective_baseline *= (0.4 + 0.6 * warmup_mult)

        # 3. Target ADC value based on gas exposure
        # Gas increases surface conductivity, pulling V_out toward V_c (ADC counts rise)
        # Using a non-linear saturation curve: target = baseline + (1023 - baseline) * (1 - exp(-k * (factor - 1)))
        if target_concentration_factor > 1.0:
            excess = target_concentration_factor - 1.0
            increase = (1023.0 - effective_baseline) * (1.0 - (1.0 / (1.0 + 0.35 * excess)))
            target_adc = effective_baseline + increase
        else:
            target_adc = effective_baseline

        # 4. Asymmetric lag: fast response during onset, slower recovery when clearing
        tau = self.tau_response if target_adc > self.current_raw_adc else self.tau_recovery
        alpha = 1.0 - math.exp(-max(0.0, dt) / max(0.1, tau))
        self.current_raw_adc = alpha * target_adc + (1.0 - alpha) * self.current_raw_adc

        # 5. Gaussian noise
        noise = self.rng.gaussian(0.0, self.noise_std_dev)
        noisy_adc = self.current_raw_adc + noise

        # 6. Quantize through Arduino 10-bit ADC
        quantized_adc = max(0, min(1023, int(round(noisy_adc))))
        voltage_v = self.adc.adc_to_voltage(quantized_adc)

        # Normalized ratio (relative response relative to max ADC)
        normalized_ratio = round(quantized_adc / 1023.0, 4)

        return {
            "raw_adc": quantized_adc,
            "voltage_v": round(voltage_v, 3),
            "normalized_ratio": normalized_ratio,
            "is_warmed_up": is_warmed_up,
        }


class MQ2Model(MQGasSensorModel):
    """
    MQ-2 Smoke and Combustible Gas Sensor.
    Clean air baseline ADC: ~125 counts (0.61 V).
    Sensitive to LPG, smoke, methane, butane.
    """

    def __init__(self, rng: SeededRNG, adc: ADCQuantizer):
        super().__init__(
            name="MQ-2 Smoke/Combustible Gas",
            analog_pin="A0",
            rng=rng,
            adc=adc,
            baseline_adc=125,
            noise_std_dev=3.8,
            tau_response=5.0,
            tau_recovery=12.0,
            warmup_duration_sec=25.0,
        )


class MQ7Model(MQGasSensorModel):
    """
    MQ-7 Carbon Monoxide (CO) Sensor.
    Clean air baseline ADC: ~95 counts (0.46 V).
    Sensitive to CO emissions.
    """

    def __init__(self, rng: SeededRNG, adc: ADCQuantizer):
        super().__init__(
            name="MQ-7 Carbon Monoxide",
            analog_pin="A1",
            rng=rng,
            adc=adc,
            baseline_adc=95,
            noise_std_dev=4.2,
            tau_response=7.0,
            tau_recovery=16.0,
            warmup_duration_sec=30.0,
        )


class MQ135Model(MQGasSensorModel):
    """
    MQ-135 Air Quality / Hazardous Gas Sensor.
    Clean ambient air baseline ADC: ~150 counts (0.73 V).
    Sensitive to NH3, NOx, alcohol, benzene, smoke, CO2.
    """

    def __init__(self, rng: SeededRNG, adc: ADCQuantizer):
        super().__init__(
            name="MQ-135 Air Quality",
            analog_pin="A2",
            rng=rng,
            adc=adc,
            baseline_adc=150,
            noise_std_dev=4.5,
            tau_response=6.0,
            tau_recovery=15.0,
            warmup_duration_sec=25.0,
        )


class IRSensorModel:
    """
    Simulates the digital optical beam-break / dust occlusion sensor (D2).
    Digital state:
    0 = Clear optical path (Normal baseline)
    1 = Beam broken (occlusion, high particulate density, or optical fault)
    """

    def __init__(self, rng: SeededRNG):
        self.rng = rng
        self.fault_mode: Optional[str] = None  # None, "stuck_on", "stuck_off"

    def reset(self) -> None:
        self.fault_mode = None

    def set_fault(self, fault: Optional[str]) -> None:
        self.fault_mode = fault

    def step(self, target_state: int, flutter_probability: float = 0.0) -> int:
        if self.fault_mode == "stuck_on":
            return 1
        if self.fault_mode == "stuck_off":
            return 0

        # Optional optical flutter / jitter during heavy smoke/dust
        if flutter_probability > 0:
            if self.rng.uniform(0.0, 1.0) < flutter_probability:
                return 1 if target_state == 0 else 0

        return 1 if target_state == 1 else 0


class DeviceHousekeepingModel:
    """
    Models physical device metrics and health:
    - Supply/battery voltage: 5.0 V nominal (small simulated ripple 4.95 - 5.05 V)
    - Device uptime in seconds
    - Telemetry packet sequence counter (incremented per emitted packet)
    - Sensor warm-up status across MQ modules
    - Overall device operational health flag
    """

    def __init__(self, rng: SeededRNG):
        self.rng = rng
        self.uptime_sec = 0.0
        self.sequence_counter = 0
        self.nominal_voltage = 5.00
        self.is_connected = True
        self.health_status = "HEALTHY"  # "HEALTHY", "DEGRADED", "CRITICAL_FAULT"

    def reset(self) -> None:
        self.uptime_sec = 0.0
        self.sequence_counter = 0
        self.is_connected = True
        self.health_status = "HEALTHY"

    def advance_time(self, dt: float) -> None:
        self.uptime_sec += max(0.0, dt)

    def next_sequence(self) -> int:
        seq = self.sequence_counter
        self.sequence_counter += 1
        return seq

    def get_voltage(self) -> float:
        # Subtle supply rail ripple ±0.03 V
        ripple = self.rng.gaussian(0.0, 0.015)
        return max(4.5, min(5.3, round(self.nominal_voltage + ripple, 2)))

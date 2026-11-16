# SIMULATION ENGINE ARCHITECTURE & NUMERICAL PHYSICS

## 1. Overview

The **ALLEVIA Local Simulation Engine** is a deterministic, time-stepped numerical physics core written in Python 3.11+. It models the electrical, environmental, and gas dynamics of the physical **ALLEVIA Detector Box** without connecting to any external backend or requiring real-time clock waits.

Every generated packet is tagged with:
```json
"source": "simulated"
```

---

## 2. Mathematical Models & Equations

### 2.1 ATmega328P 10-Bit ADC Successive Approximation Model
The physical Arduino Uno converts analog pin voltages ($0.0\text{--}5.0\text{ V}$) into 10-bit integer registers:
$$\text{ADC} = \mathrm{clamp}\left(\mathrm{round}\left(\frac{V_{\text{pin}}}{V_{\text{ref}}} \times 1023\right), 0, 1023\right)$$
where $V_{\text{ref}} = 5.0\text{ V}$ and resolution $\Delta V \approx 4.8875\text{ mV/count}$.

### 2.2 Metal-Oxide Sensor Resistance & Gas Response (MQ Series)
The MQ-2, MQ-7, and MQ-135 sensors utilize a heated tin-dioxide ($SnO_2$) sensing element. The analog pin voltage output across load resistor $R_L = 10\text{ k}\Omega$ follows:
$$V_{\text{out}} = V_c \cdot \frac{R_L}{R_s + R_L}$$
When target gas concentration rises ($c > 1.0$), surface resistance $R_s$ drops, causing output voltage and ADC register counts to climb according to the non-linear saturation curve:
$$\text{ADC}_{\text{target}} = \text{ADC}_{\text{baseline}} + (1023 - \text{ADC}_{\text{baseline}}) \cdot \left(1 - \frac{1}{1 + 0.35 \cdot (c - 1)}\right)$$

### 2.3 Sensor Pre-Heating / Warm-up Transient
Metal oxide sensors require internal coil pre-heating. The engine models this via an exponential warm-up multiplier:
$$\eta_{\text{warmup}}(t) = 1.0 - e^{-t / \tau_{\text{warmup}}}$$
where $\tau_{\text{warmup}} \approx 8\text{--}10\text{ s}$ ($25\text{--}30\text{ s}$ to full stability).

### 2.4 Environmental Cross-Sensitivity & Thermal Drift
Ambient temperature and humidity affect gas sensor conductivity:
$$\delta_{\text{temp}}(T) = 1.0 + 0.008 \cdot (T - 25.0^\circ\text{C})$$
$$\delta_{\text{hum}}(RH) = 1.0 + 0.003 \cdot (RH - 50.0\%)$$
$$\text{ADC}_{\text{effective\_baseline}} = \text{ADC}_{\text{nominal}} \cdot \delta_{\text{temp}} \cdot \delta_{\text{hum}} \cdot (0.4 + 0.6 \cdot \eta_{\text{warmup}})$$

### 2.5 Dynamic Lag & Asymmetric Recovery
Sensors exhibit physical response lag modeled via a discrete first-order filter:
$$\alpha = 1.0 - e^{-\Delta t / \tau}$$
$$\text{ADC}[k] = \alpha \cdot \text{ADC}_{\text{target}} + (1 - \alpha) \cdot \text{ADC}[k-1]$$
To reflect real physical sensor kinetics, response onset ($\tau_{\text{response}} \approx 5\text{--}7\text{ s}$) is significantly faster than post-exposure clearing ($\tau_{\text{recovery}} \approx 12\text{--}16\text{ s}$).

### 2.6 Seeded Pseudo-Random Gaussian Noise
To ensure 100% reproducible benchmark and test simulations, noise is added via a seeded pseudo-random normal generator:
$$x_{\text{noisy}} = x + \epsilon, \quad \epsilon \sim \mathcal{N}(0, \sigma^2)$$

---

## 3. Physical Sensor Channels Modeled

| Sensor | Channel / Pin | Physical Properties | Clean Air Baseline | Noise ($\sigma$) |
| :--- | :--- | :--- | :--- | :--- |
| **BME280** | I2C (`0x76`) | Temperature, Relative Humidity, Barometric Pressure | $22.0^\circ\text{C}, 48.0\%, 1013.25\text{ hPa}$ | $\pm 0.12^\circ\text{C}, \pm 0.6\%, \pm 0.25\text{ hPa}$ |
| **MQ-2** | Analog `A0` | Smoke & Combustible Hydrocarbons (LPG, Butane, Methane) | $\approx 125\text{ ADC counts}$ ($0.61\text{ V}$) | $\pm 3.8\text{ counts}$ |
| **MQ-7** | Analog `A1` | Carbon Monoxide ($CO$) | $\approx 95\text{ ADC counts}$ ($0.46\text{ V}$) | $\pm 4.2\text{ counts}$ |
| **MQ-135**| Analog `A2` | Air Quality & Volatile Organic Compounds ($NH_3, NO_x$, Benzene) | $\approx 150\text{ ADC counts}$ ($0.73\text{ V}$) | $\pm 4.5\text{ counts}$ |
| **IR Sensor**| Digital `D2` | Optical beam break (provisional: particulate density / occlusion) | `0` (Clear path) | Digital flag ($0$ or $1$) |
| **Housekeeping**| Internal | Supply voltage ($5.0\text{ V} \pm 0.02\text{ V}$), uptime ($s$), sequence counter | $5.00\text{ V}$ | Voltage ripple $\pm 0.015\text{ V}$ |

---

## 4. The Six Environmental Scenarios

1. **Scenario 1 — Normal Day (`scenario-01`)**: Stable workplace baseline ($22.0\text{--}23.5^\circ\text{C}$, $48\text{--}52\%$ RH). All gas sensors remain at nominal clean air baseline; simulated risk tier is `GREEN`.
2. **Scenario 2 — Midday Heatwave (`scenario-02`)**: Ambient temperature escalates to $43.5^\circ\text{C}$ while relative humidity drops to $19\%$. Triggers thermal warning tiers `YELLOW` ($>32^\circ\text{C}$), `ORANGE` ($>38^\circ\text{C}$), and `RED` ($>42^\circ\text{C}$).
3. **Scenario 3 — Humid Heat (`scenario-03`)**: Dangerous wet-bulb stress spike ($36^\circ\text{C}$ at $94\%$ RH). Triggers severe humid heat warning (`RED`).
4. **Scenario 4 — Smoke or Dust Episode (`scenario-04`)**: Rapid smoke ingress driving MQ-2 ADC from $125 \to 750+$ counts, MQ-135 from $150 \to 600+$, and intermittent optical IR beam interruption. Triggers `SMOKE` hazard alert (`RED`).
5. **Scenario 5 — Gas Leak Demo (`scenario-05`)**: Simulated toxic Carbon Monoxide leak driving MQ-7 ADC from $95 \to 850+$ counts with secondary combustible response on MQ-2. Triggers `TOXIC_GAS` alert (`RED`).
6. **Scenario 6 — Sensor Fault & Diagnostics (`scenario-06`)**: Hardware anomalies including BME280 I2C bus dropout ($-999.0$ dropout codes), open-circuit ground pull-up on MQ-7 ($1023$ counts), erratic stepped transitions on MQ-2, and permanently stuck IR beam. Triggers `FAULT` tier.

---

## 5. Local Event Processor & Regulatory Disclaimers

The **Local Event Processor** evaluates telemetry packets against educational thresholds to generate structured simulated warning events.

> [!WARNING]
> **Regulatory and Medical Disclaimer**:
> Local simulated events and risk tier evaluations (`GREEN`, `YELLOW`, `ORANGE`, `RED`, `FAULT`) are generated strictly for simulator demonstration and education. They are **NOT** clinical medical diagnoses, certified OSHA/NIOSH workplace safety determinations, or certified life-safety emergency alarms.
>
> Furthermore, analog ADC counts from MQ sensors are uncalibrated raw voltage divider values and must not be interpreted as certified parts-per-million (ppm) measurements without a certified environmental calibration chamber.

---

## 6. Telemetry Packet Schema Example

```json
{
  "schema_version": "1.1.0",
  "packet_id": "PKT-E5D3C187B02A",
  "session_id": "92f72a45-6678-43bb-a8d6-7248f32152a4",
  "device_id": "ALLEVIA-SIM-A4C1",
  "sequence_number": 42,
  "timestamp": "2026-11-16T10:30:00.000000Z",
  "source": "simulated",
  "scenario_id": "scenario-02",
  "sim_time_sec": 145.0,
  "readings": {
    "bme280": {
      "temperature_c": 39.12,
      "humidity_pct": 25.43,
      "pressure_hpa": 1009.31
    },
    "mq2_raw": 138,
    "mq7_raw": 102,
    "mq135_raw": 164,
    "ir_state": 0,
    "battery_voltage_v": 5.01,
    "mq2_details": {
      "raw_adc": 138,
      "voltage_v": 0.674,
      "normalized_ratio": 0.1349,
      "is_warmed_up": true
    },
    "mq7_details": {
      "raw_adc": 102,
      "voltage_v": 0.499,
      "normalized_ratio": 0.0997,
      "is_warmed_up": true
    },
    "mq135_details": {
      "raw_adc": 164,
      "voltage_v": 0.802,
      "normalized_ratio": 0.1603,
      "is_warmed_up": true
    }
  },
  "device_health": {
    "is_connected": true,
    "health_status": "HEALTHY",
    "uptime_sec": 145.0,
    "all_warmed_up": true
  },
  "simulated_tier": "ORANGE",
  "active_events": [
    {
      "event_id": "EVT-8F21B3A0",
      "timestamp": "2026-11-16T10:30:00.000000Z",
      "sim_time_sec": 145.0,
      "severity": "HIGH",
      "event_category": "THERMAL",
      "triggering_sensor": "BME280",
      "observed_value": 39.12,
      "threshold_value": 38.0,
      "human_explanation": "Elevated ambient temperature (39.1°C) indicates severe thermal strain.",
      "source": "simulated"
    }
  ]
}
```

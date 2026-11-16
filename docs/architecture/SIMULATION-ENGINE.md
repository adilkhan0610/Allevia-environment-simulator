# SIMULATION ENGINE SPECIFICATION
## Physics Models, Environmental Scenarios, and Sensor Dynamics

- **Document Version:** 1.0.0
- **Status:** Approved Architecture Blueprint
- **Phase:** Phase 0 — Technical Inspection & Architecture

---

## 1. Overview & Mathematical Foundations

The ALLEVIA Simulation Engine is a deterministic, time-stepped numerical simulator implemented in Python using `asyncio`. It reproduces the physical and electrical behavior of the sensors hosted on the physical ALLEVIA Detector Box.

The engine computes simulated environmental states at continuous simulation time $t$, modulates them through baseline curves and scenario events, applies physical noise and thermal drift, and converts the resulting analog voltages into integer 10-bit Analog-to-Digital Converter (ADC) registers ($0\dots 1023$) representing the ATmega328P ADC behavior.

### 1.1 Analog-to-Digital Conversion (ADC) Model
The physical Arduino Uno utilizes a 10-bit successive approximation ADC with an internal or external $V_{\text{ref}} = 5.0\text{ V}$.

$$\text{ADC} = \mathrm{clamp}\left(\left\lfloor \frac{V_{\text{out}}}{V_{\text{ref}}} \times 1023 \right\rceil, 0, 1023\right)$$

$$\text{Resolution: } \Delta V = \frac{5.0\text{ V}}{1023} \approx 4.8875\text{ mV per LSB}$$

### 1.2 Gas Sensor Resistance & Concentration Models (MQ Series)
The MQ-2, MQ-7, and MQ-135 sensors utilize a tin dioxide ($SnO_2$) sensitive layer whose surface conductivity increases as reducing gas concentrations rise. The sensor resistance $R_s$ is derived from the voltage divider:

$$V_{\text{out}} = V_c \cdot \frac{R_L}{R_s + R_L} \implies R_s = R_L \cdot \left(\frac{V_c - V_{\text{out}}}{V_{\text{out}}}\right)$$

where:
- $V_c = 5.0\text{ V}$ (Circuit supply voltage)
- $R_L = 10.0\text{ k}\Omega$ (Load resistance on breakout board)
- $R_0 = \text{Sensor resistance in clean air at standard temperature/humidity}$

Gas concentration in parts-per-million ($\text{ppm}$) is related to the resistance ratio $R_s / R_0$ via the empirical power-law equation:

$$\log_{10}(\text{ppm}) = \frac{\log_{10}(R_s / R_0) - b}{m} \iff \text{ppm} = 10^{\frac{\log_{10}(R_s / R_0) - b}{m}}$$

where $m$ is the slope and $b$ is the intercept calibrated for specific target gases.

### 1.3 Gaussian Noise & Thermal Drift Model
Real sensors experience thermal drift and Johnson–Nyquist / flicker noise. For metric $x_i(t)$:

$$x_i^{\text{noisy}}(t) = x_i(t) + \delta_i^{\text{drift}}(t) + \epsilon_i(t)$$

where:
- $\epsilon_i(t) \sim \mathcal{N}(0, \sigma_i^2)$ (Zero-mean Gaussian white noise)
- $\delta_i^{\text{drift}}(t) = k_{\text{temp}} \cdot (T(t) - 25.0) + k_{\text{aging}} \cdot t$ (Temperature and time drift)

### 1.4 Sensor Pre-Heating & Warm-Up Curve
Metal oxide sensors require initial heating of their internal coil before reaching stable baseline sensitivity. The simulator implements an exponential warm-up multiplier:

$$\eta_{\text{warmup}}(t) = 1.0 - e^{-t / \tau_{\text{warmup}}}$$

During the warm-up cycle ($t < 3\tau$), analog readings exhibit realistic initial settling transients before stabilizing.

---

## 2. Sensor Channel Specifications

### 2.1 BME280 Digital Sensor (I2C)
The physical BME280 delivers pre-quantized digital environmental readings over I2C.
- **Temperature ($T$):**
  - Range: $-40.0^\circ\text{C}$ to $+85.0^\circ\text{C}$
  - Resolution: $0.01^\circ\text{C}$
  - Typical Noise ($\sigma$): $\pm 0.15^\circ\text{C}$
- **Relative Humidity ($RH$):**
  - Range: $0.0\%$ to $100.0\%$
  - Resolution: $0.01\%$
  - Typical Noise ($\sigma$): $\pm 0.8\%$
- **Atmospheric Pressure ($P$):**
  - Range: $300.0\text{ hPa}$ to $1100.0\text{ hPa}$
  - Resolution: $0.18\text{ hPa}$
  - Typical Noise ($\sigma$): $\pm 0.35\text{ hPa}$

### 2.2 MQ-2 Sensor (Smoke & Combustible Gas)
- **Target Gases:** LPG, Propane, Hydrogen, Methane, Smoke.
- **Physical Output:** Analog pin connected to Arduino `A0`.
- **ADC Baseline (Clean Air):** $120 \pm 20$ counts ($V_{\text{out}} \approx 0.58\text{ V}$).
- **Moderate Smoke / Gas:** $350 \dots 550$ counts.
- **Heavy Hazard:** $700 \dots 950$ counts.
- **Noise ($\sigma$):** $\pm 4$ ADC counts.

### 2.3 MQ-7 Sensor (Carbon Monoxide - CO)
- **Target Gas:** Carbon Monoxide ($CO$).
- **Physical Output:** Analog pin connected to Arduino `A1`.
- **ADC Baseline (Clean Air):** $95 \pm 15$ counts ($V_{\text{out}} \approx 0.46\text{ V}$).
- **Advisory Exposure (35–50 ppm):** $280 \dots 420$ counts.
- **Dangerous Exposure (>100 ppm):** $650 \dots 920$ counts.
- **Noise ($\sigma$):** $\pm 5$ ADC counts.

### 2.4 MQ-135 Sensor (Air Quality & Volatile Gases)
- **Target Gases:** Ammonia ($NH_3$), $NO_x$, Alcohol, Benzene, $CO_2$.
- **Physical Output:** Analog pin connected to Arduino `A2`.
- **ADC Baseline (Clean Ambient):** $150 \pm 25$ counts ($V_{\text{out}} \approx 0.73\text{ V}$).
- **Degraded Air Quality:** $380 \dots 520$ counts.
- **Hazardous Contamination:** $650 \dots 880$ counts.
- **Noise ($\sigma$):** $\pm 6$ ADC counts.

### 2.5 IR Sensor (Optical Obstacle / Dust Event Flag)
- **Target Signal:** Digital optical beam state connected to Arduino `D2`.
- **Logic Level:** Active Low / Active High configurable.
- **Output:** Digital boolean flag:
  - `0`: Clear path / normal baseline.
  - `1`: Beam broken (occlusion, high particulate density, or optical fault).

---

## 3. The Six Environmental Scenarios

The simulator incorporates six distinct, data-driven scenario profiles. Each scenario specifies parametric time curves, baseline shifts, perturbation events, and recovery behaviors.

### Scenario 1: Normal Day (Baseline Workplace Environment)
- **Objective:** Demonstrates stable, healthy indoor/outdoor working conditions with mild diurnal variation.
- **Duration:** Continuous loop (10-minute cycle or user-driven).
- **Dynamics:**
  - Temperature: $21.5^\circ\text{C} \to 24.8^\circ\text{C}$ (gentle sinusoidal diurnal drift).
  - Humidity: $45.0\% \to 52.0\%$.
  - Pressure: $1013.25 \pm 1.5\text{ hPa}$.
  - MQ-2 ADC: Steady clean baseline ($110 \dots 135$).
  - MQ-7 ADC: Clean baseline ($85 \dots 105$).
  - MQ-135 ADC: Normal indoor air ($140 \dots 170$).
  - IR Sensor: Stable $0$ (Unobstructed).
- **Simulated Risk Tier:** `GREEN (Normal / Safe)`

### Scenario 2: Midday Heatwave (Thermal Stress Spike)
- **Objective:** Evaluates heat strain warning mechanisms driven by thermal metrics.
- **Dynamics:**
  - Temperature: Rapid rise from $26.0^\circ\text{C}$ to $43.5^\circ\text{C}$ over 180 seconds.
  - Humidity: Drops inversely from $48\%$ to $22\%$.
  - Pressure: Drops slightly ($1008.0\text{ hPa}$).
  - MQ Sensors: Minor thermal baseline elevation ($+15$ ADC counts due to heating).
  - IR Sensor: $0$.
- **Simulated Risk Tier:** Transitions from `GREEN` $\to$ `YELLOW` ($32^\circ\text{C}$) $\to$ `ORANGE` ($38^\circ\text{C}$) $\to$ `RED` ($42^\circ\text{C}$).

### Scenario 3: Humid Heat (Dangerous Wet-Bulb Condition)
- **Objective:** Simulates high-risk combined heat-humidity stress where sweat evaporation fails.
- **Dynamics:**
  - Temperature: Elevates to $35.0^\circ\text{C}$.
  - Humidity: Rises sharply to $88.0\% \dots 95.0\%$.
  - Pressure: $1005.0\text{ hPa}$ (tropical depression profile).
  - MQ Sensors: Humidity correction factor shifts resistance down slightly ($+30$ ADC counts).
  - IR Sensor: $0$.
- **Simulated Risk Tier:** Rapid escalation to `ORANGE` $\to$ `RED` due to severe heat index impact.

### Scenario 4: Smoke or Dust Episode (Particulate / Fire Advisory)
- **Objective:** Simulates localized smoke infiltration, particulate build-up, or smoldering material.
- **Dynamics:**
  - Temperature: Steady baseline ($23.0^\circ\text{C}$).
  - Humidity: Slight drop.
  - MQ-2 ADC: Sudden logarithmic rise from $130 \to 780$ within 45 seconds.
  - MQ-135 ADC: Spikes from $160 \to 690$.
  - MQ-7 ADC: Moderate secondary rise ($90 \to 280$).
  - IR Sensor: Intermittent fluttering $0 \leftrightarrow 1$ representing optical smoke occlusion.
- **Simulated Risk Tier:** Immediate transition `GREEN` $\to$ `ORANGE` $\to$ `RED`.

### Scenario 5: Gas Leak (Simulated Industrial Emergency Demo)
- **Objective:** Demonstrates targeted toxic gas detection (Carbon Monoxide and combustible fuel gas).
- **Notice:** Explicitly watermarked for demonstration and safety education.
- **Dynamics:**
  - Temperature & Humidity: Ambient baseline.
  - MQ-7 ADC: Steep exponential spike from $95 \to 890$ ($>250\text{ ppm CO}$ equivalent).
  - MQ-2 ADC: Secondary spike ($120 \to 610$).
  - MQ-135 ADC: Rises to $540$.
  - IR Sensor: $0$.
- **Simulated Risk Tier:** Immediate emergency `RED` warning with high-priority audio-visual cue.

### Scenario 6: Sensor Fault (Diagnostic & Anomaly Detection)
- **Objective:** Tests the platform's ability to identify hardware malfunctions, line breaks, and stuck bits.
- **Dynamics:**
  - BME280: Drops to `null` or emits $-999.0$ dropout codes (I2C bus lockup).
  - MQ-7 ADC: Rails to $1023$ (open-circuit ground pull-up) or $0$ (short to ground).
  - MQ-2 ADC: Emits erratic step transitions ($100 \to 950 \to 50$ every 2 seconds).
  - IR Sensor: Permanently stuck at $1$.
- **Simulated Risk Tier:** `HARDWARE_FAULT / UNRELIABLE` warning flag.

---

## 4. Scenario JSON Configuration Schema

Each scenario is stored in `backend/app/engine/scenarios/<scenario_id>.json`. The schema is defined below:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ScenarioConfiguration",
  "type": "object",
  "required": ["id", "name", "description", "duration_seconds", "random_seed", "channels"],
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "description": { "type": "string" },
    "duration_seconds": { "type": "integer", "minimum": 10 },
    "random_seed": { "type": "integer" },
    "channels": {
      "type": "object",
      "required": ["temperature", "humidity", "pressure", "mq2", "mq7", "mq135", "ir"],
      "properties": {
        "temperature": { "$ref": "#/definitions/ChannelCurve" },
        "humidity": { "$ref": "#/definitions/ChannelCurve" },
        "pressure": { "$ref": "#/definitions/ChannelCurve" },
        "mq2": { "$ref": "#/definitions/ChannelCurve" },
        "mq7": { "$ref": "#/definitions/ChannelCurve" },
        "mq135": { "$ref": "#/definitions/ChannelCurve" },
        "ir": { "$ref": "#/definitions/BinaryChannelCurve" }
      }
    }
  },
  "definitions": {
    "ChannelCurve": {
      "type": "object",
      "required": ["baseline", "noise_std_dev", "keyframes"],
      "properties": {
        "baseline": { "type": "number" },
        "noise_std_dev": { "type": "number", "minimum": 0 },
        "keyframes": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["time_sec", "value", "interpolation"],
            "properties": {
              "time_sec": { "type": "number" },
              "value": { "type": "number" },
              "interpolation": { "type": "string", "enum": ["linear", "exponential", "step"] }
            }
          }
        }
      }
    },
    "BinaryChannelCurve": {
      "type": "object",
      "required": ["default_state", "triggers"],
      "properties": {
        "default_state": { "type": "integer", "enum": [0, 1] },
        "triggers": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["start_sec", "end_sec", "state"],
            "properties": {
              "start_sec": { "type": "number" },
              "end_sec": { "type": "number" },
              "state": { "type": "integer", "enum": [0, 1] }
            }
          }
        }
      }
    }
  }
}
```

---

## 5. Fault Injection Engine

The simulator includes an interactive fault-injection subsystem allowing evaluators to stress-test system diagnostics:

| Fault Type | Target Channel | Mechanism | Signature in Telemetry |
| :--- | :--- | :--- | :--- |
| **Sensor Disconnect** | Any channel | Simulates severed jumper wire or loose breadboard pin. | Analog ADC rails to $0$ or $1023$; I2C channels emit `null`. |
| **Stuck Bit (High/Low)** | ADC registers | Emulates internal ADC latch failure. | Reading frozen at fixed value regardless of scenario curve. |
| **Excessive Noise** | Any analog channel | Multiplies Gaussian standard deviation ($\times 10$). | High-frequency jitter across packet sequence. |
| **Thermal Drift Runaway** | BME280 / MQ-7 | Continuous monotonic baseline ramp ($+0.2^\circ\text{C}/\text{sec}$). | Slow, un-physical metric deviation. |
| **Intermittent Dropout** | IR / I2C Bus | Random packet dropped every $N$ ticks ($p = 0.3$). | Missing packets or packet loss counter increment. |

---

## 6. Local Simulated Risk Evaluation

To maintain 100% standalone usability, the simulator provides a local evaluation module (`LocalRiskEvaluator`). 

### Mandatory Integrity Rules
1. **Never Pretend to Be the Proprietary Engine:** All local evaluations are explicitly marked with metadata tag `tier_engine: "SIMULATED_LOCAL_RULESET"`.
2. **Simplified Threshold Matrix (For Visual Demonstration Only):**
   - **GREEN (Normal):** $T < 30^\circ\text{C}$, $\text{MQ2} < 300$, $\text{MQ7} < 250$, $\text{MQ135} < 300$, $\text{IR} = 0$.
   - **YELLOW (Advisory):** $30^\circ\text{C} \le T < 36^\circ\text{C}$ OR $\text{MQ135} \ge 300$ OR $\text{MQ2} \ge 300$.
   - **ORANGE (Warning):** $36^\circ\text{C} \le T < 40^\circ\text{C}$ OR $\text{MQ7} \ge 350$ OR $(\text{MQ2} \ge 500 \land \text{IR} = 1)$.
   - **RED (Critical):** $T \ge 40^\circ\text{C}$ OR $\text{MQ7} \ge 600$ OR $\text{MQ2} \ge 700$.
3. **Pluggable Architecture:** In Phase 10, the `LocalRiskEvaluator` will be replaced by an HTTP/WebSocket client proxying real responses from the authentic ALLEVIA risk engine.

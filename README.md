# Allevia Sim — Judging Simulator
### Standalone Interactive 3D Digital Twin & Sensor Telemetry Simulator

The **ALLEVIA Environment Simulator** is a standalone, web-based, high-fidelity interactive 3D hardware simulator for the physical **ALLEVIA Detector Box**, built for the ALLEVIA Population and Workforce Health Early Warning System.

It enables hackathon judges, technical reviewers, and clinical stakeholders to inspect the physical hardware in 3D, trigger 6 data-driven environmental hazard scenarios, observe real-time 10-bit ADC sensor telemetry streaming over WebSockets, and inspect local demonstration risk tier evaluations.

---

## 1. Key Capabilities & Features

- **Interactive 3D Procedural Hardware Twin (Three.js / React Three Fiber)**:
  - Real-time procedural rendering of the Detector Box chassis, blue PCB Arduino Uno, ATmega328P DIP-28 MCU, MQ-2, MQ-7, MQ-135, Bosch BME280, optical IR sensor, brass standoffs, and multi-color jumper wire harness.
  - Exploded assembly view with smooth lerp animation and 10 interactive Drei 3D callout leader pins.
- **Deterministic Numerical Physics Engine (Python / FastAPI)**:
  - 10-bit Successive Approximation Register (SAR) ADC quantization ($0\text{--}1023$ counts, $V_{\text{ref}} = 5.0\text{ V}$, $\approx 4.8875\text{ mV/LSB}$).
  - Metal-oxide ($SnO_2$) surface conductivity saturation curves, heater coil warm-up dynamics, thermal/humidity cross-sensitivity drift, and asymmetric response/recovery lag.
  - Reproducible pseudo-random Gaussian noise via configurable seeds.
- **Real-Time WebSocket Telemetry Streaming**:
  - Sub-second asynchronous streaming of validated Schema v1.1.0 telemetry packets watermarked with `source: "simulated"`.
  - Automatic reconnection with exponential backoff and connection state indicators.
- **Interactive Simulation Lab (`/lab`)**:
  - Live 5-channel continuous SVG sparkline waveform charts (Temperature, Humidity, MQ-2, MQ-7, MQ-135).
  - Diagnostic hardware fault injection panel (I2C lockup, open circuits, shorts, erratic steps).
  - Raw telemetry JSON packet inspector with copy, download, and clear history actions.
- **Judge Demonstration & Presentation Modes**:
  - Guided walkthroughs with dynamic step timelines for all 6 scenarios.
  - Comparative benchmark cards calculating environmental and sensor deltas against baseline.
  - Offline recorded simulation replay player with progress scrubber and speed controls.
  - Fullscreen Judge Presentation Mode with high-readability vital signs for live demonstrations.
  - Exportable CSV telemetry datasets and JSON run reports with statistical aggregations.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 (Strict Mode)
- **Language:** TypeScript 5.8+
- **Build Tool:** Vite 6.4
- **Styling:** Tailwind CSS v4 + PostCSS
- **Component Primitives:** Custom Design System (`tokens.css`, buttons, glass panels, status badges) + Lucide React
- **Animations:** Framer Motion
- **State Management:** Zustand 5
- **Routing:** React Router DOM v7
- **3D Graphics Engine:** Three.js (r180+), React Three Fiber (R3F v9), @react-three/drei (v10)
- **Schema Validation:** Zod
- **Testing:** Vitest, React Testing Library, JSDOM

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Runtime:** Asyncio + Uvicorn
- **Validation:** Pydantic v2 + Pydantic-Settings
- **Communication:** WebSockets + RESTful API
- **Testing:** Pytest, Starlette TestClient

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Specifications:** Shared JSON Schemas & Scenario Matrices

---

## 3. Physical Hardware Specification

The simulator strictly models the verified physical hardware suite:
- **Arduino Uno Rev3:** ATmega328P microcontroller with 10-bit SAR ADC ($0\text{--}1023$ counts, $5.0\text{ V}$ reference).
- **Bosch Sensortec BME280:** Digital I2C environmental sensor measuring Temperature (°C), Relative Humidity (%), and Pressure (hPa).
- **MQ-2:** Analog smoke and flammable gas sensor (Pin `A0`, $0\text{--}1023$ ADC).
- **MQ-7:** Analog Carbon Monoxide (CO) sensor (Pin `A1`, $0\text{--}1023$ ADC).
- **MQ-135:** Analog air quality and volatile organic sensor (Pin `A2`, $0\text{--}1023$ ADC).
- **IR Sensor:** Digital optical obstacle / beam interrupter (Pin `D2`, $0 = \text{Clear}$, $1 = \text{Broken}$).
- **Perimeter Ring:** Continuous cyan-blue LED perimeter illumination.

> [!IMPORTANT]
> **Strict Negative Scope Constraints**:
> The physical Detector Box contains **NO PM2.5 laser sensors**, **NO black-globe temperature probes**, and **NO native wireless networking** on the Arduino Uno. The simulator does not manufacture or claim these capabilities.

---

## 4. The Six Environmental Scenarios

1. **Scenario 1 — Normal Day (`scenario-01`)**: Stable workplace baseline ($22.0\text{--}23.5^\circ\text{C}$, $48\text{--}52\%$ RH). Clean air gas baselines; risk tier `GREEN`.
2. **Scenario 2 — Midday Heatwave (`scenario-02`)**: Ambient temperature escalates to $43.5^\circ\text{C}$ with dry air ($19\%$ RH). Triggers thermal warning tiers `YELLOW` ($>32^\circ\text{C}$), `ORANGE` ($>38^\circ\text{C}$), and `RED` ($>42^\circ\text{C}$).
3. **Scenario 3 — Humid Heat (`scenario-03`)**: High wet-bulb thermal stress ($36.2^\circ\text{C}$ at $94\%$ RH) where evaporative cooling fails; triggers `RED` alert.
4. **Scenario 4 — Smoke or Dust Episode (`scenario-04`)**: Rapid smoke ingress driving MQ-2 to $780$ ADC, MQ-135 to $690$ ADC, and optical IR beam flutter; triggers `SMOKE` hazard alert (`RED`).
5. **Scenario 5 — Gas Leak Demo (`scenario-05`)**: Simulated industrial emergency demonstration exhibiting an exponential Carbon Monoxide spike (MQ-7 to $890$ ADC) and combustible gas secondary response; triggers `TOXIC_GAS` alert (`RED`).
6. **Scenario 6 — Sensor Fault & Diagnostics (`scenario-06`)**: Hardware anomalies including BME280 I2C bus dropout ($-999.0$ code), open-circuit ground pull-up on MQ-7 ($1023$ counts), erratic stepped transitions on MQ-2, and stuck optical beam; triggers `FAULT` tier.

---

## 5. Local Development Setup

### Prerequisites
- **Node.js:** v20.0+ (Tested on v22.23.3)
- **pnpm:** v10+ (or npm)
- **Python:** 3.11+ (Tested on Python 3.11.8)
- **Docker:** Optional (for containerized execution)

---

### Frontend Startup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
pnpm install

# Start Vite development server
pnpm run dev
```
The frontend will be available at: **http://localhost:5173**

---

### Backend Startup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- API Base URL: **http://localhost:8000**
- Interactive Swagger Docs: **http://localhost:8000/docs**
- Health Check: **http://localhost:8000/health**

---

### Docker Compose Startup
To run the full stack containerized:
```bash
docker compose up --build
```
- Frontend: **http://localhost:5173**
- Backend: **http://localhost:8000**

---

## 6. Verification & Quality Gates

### Frontend Checks
```bash
cd frontend

# Run strict TypeScript validation (Zero errors)
pnpm run typecheck

# Run ESLint (Zero errors/warnings)
pnpm run lint

# Run Vitest component & unit tests (38 tests)
pnpm test

# Run production build
pnpm run build
```

### Backend Tests
```bash
# Run Pytest suite (27 tests)
python -m pytest backend/tests -v
```

---

## 7. Data Integrity, Disclaimers & Limitations

1. **Simulated Data Guarantee**: Every emitted packet and telemetry log explicitly contains `"source": "simulated"`.
2. **Uncalibrated Gas Sensor Outputs**: Analog ADC registers from the MQ-2, MQ-7, and MQ-135 sensors represent raw relative voltage divider counts ($0\text{--}1023$) and must not be interpreted as certified parts-per-million (ppm) concentrations.
3. **Local Demonstration Events**: Evaluated warning events and risk tier classifications (`GREEN`, `YELLOW`, `ORANGE`, `RED`, `FAULT`) are local educational demonstration rules and do not constitute clinical medical diagnoses or OSHA/NIOSH workplace safety certifications.
4. **Planned Backend Integration Boundary**: The simulator operates completely independently. A future bridge to the real ALLEVIA platform is scheduled for Phase 10 via an isolated adapter.

---

## 8. License & Project Status

Developed for the **ALLEVIA Population and Workforce Health Early Warning System**. All rights reserved.

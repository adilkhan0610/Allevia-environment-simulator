# ALLEVIA Environment Simulator
### Standalone Interactive 3D Digital Twin & Sensor Telemetry Simulator

The **ALLEVIA Environment Simulator** is a standalone, web-based, high-fidelity interactive 3D hardware simulator for the physical **ALLEVIA Detector Box**, built for the ALLEVIA Population and Workforce Health Early Warning System.

It enables judges, evaluators, and stakeholders to experience the Detector Box virtually in 3D, inspect internal components in exploded-view assemblies, trigger 6 environmental hazard scenarios, and observe live 10-bit ADC sensor telemetry with simulated risk-tier evaluations.

---

## 1. Technology Stack

### Frontend
- **Framework:** React 19 (Strict Mode)
- **Language:** TypeScript 5.7+
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS v4 + PostCSS
- **Component Primitives:** shadcn/ui + Radix UI + Lucide React
- **Animations:** Framer Motion
- **State Management:** Zustand 5
- **Routing:** React Router DOM v7
- **3D Graphics Engine:** Three.js, React Three Fiber (R3F), @react-three/drei
- **Schema Validation:** Zod

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Runtime:** Asyncio + Uvicorn
- **Validation:** Pydantic v2 + Pydantic-Settings
- **Communication:** WebSockets + RESTful API
- **Testing:** Pytest, Pytest-Asyncio, HTTPX

### Infrastructure & Supporting
- **Containerization:** Docker & Docker Compose
- **Specifications:** Shared JSON Schemas & Scenario Matrices

---

## 2. Repository Structure

```text
allevia-environment-simulator/
├── frontend/
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── app/                # App component & router configuration
│   │   ├── assets/             # 3D models, textures, images
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI primitives (Button, Card, etc.)
│   │   │   ├── layout/         # AppLayout, Navbar, Footer
│   │   │   └── shared/         # StatusBadge, Container, shared widgets
│   │   ├── pages/              # IntroPage (/), LabPage (/lab), AboutPage (/about), 404
│   │   ├── three/              # Three.js 3D assemblies & R3F viewports (Phase 4)
│   │   ├── animations/         # Framer Motion transitions
│   │   ├── hooks/              # Custom hooks (useWebSocket, etc.)
│   │   ├── store/              # Modular Zustand stores (simulation, telemetry, theme)
│   │   ├── services/           # Typed ApiClient & WebSocketSimulationClient
│   │   ├── styles/             # Tailwind CSS & global theme tokens
│   │   ├── types/              # Strict TypeScript definitions
│   │   └── utils/              # Helper utilities (cn, formatting)
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
│
├── backend/
│   ├── app/
│   │   ├── api/                # API router & endpoints (health, scenarios, sessions)
│   │   ├── core/               # Configuration & security settings
│   │   ├── models/             # In-memory simulation models
│   │   ├── schemas/            # Pydantic request & response schemas
│   │   ├── services/           # Scenario & session lifecycle services
│   │   ├── simulator/          # Physics & numerical telemetry engine (Phase 5)
│   │   └── websocket/          # ConnectionManager & streaming handlers
│   ├── tests/                  # Pytest unit & integration tests
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt
│   └── Dockerfile
│
├── shared/
│   ├── schemas/                # Provisional JSON schemas (device, packet, telemetry)
│   └── configuration/          # Sensor channel pinouts & calibration configs
│
├── scenarios/                  # 6 Environmental scenario metadata definitions
│   ├── 01_normal_day.json
│   ├── 02_midday_heatwave.json
│   ├── 03_humid_heat.json
│   ├── 04_smoke_dust_episode.json
│   ├── 05_gas_leak.json
│   └── 06_sensor_fault.json
│
├── docs/
│   └── architecture/           # Phase 0 Architecture Blueprints & Integration Plans
│
├── docker-compose.yml          # Multi-container orchestration
└── .env.example                # Unified local environment template
```

---

## 3. Physical Hardware Specification

The simulator strictly mirrors the physical ALLEVIA Detector Box:
- **Arduino Uno Rev3:** ATmega328P microcontroller with 10-bit Successive Approximation ADC (0–1023 counts, 5.0V reference).
- **BME280:** Digital I2C environmental sensor measuring Temperature (°C), Relative Humidity (%), and Pressure (hPa).
- **MQ-2:** Analog smoke and flammable gas sensor (Pin A0, 0–1023 ADC).
- **MQ-7:** Analog Carbon Monoxide (CO) sensor (Pin A1, 0–1023 ADC).
- **MQ-135:** Analog air quality and volatile organic sensor (Pin A2, 0–1023 ADC).
- **IR Sensor:** Digital optical obstacle / beam interrupter (Pin D2, 0=Clear, 1=Broken).
- **Perimeter Ring:** Cyan-blue status LED perimeter.
- *Strict negative scope: No PM2.5 or globe-temperature probes.*

---

## 4. Local Development Setup

### Prerequisites
- **Node.js:** v20.0+ (Tested on v22.23.3)
- **pnpm / npm:** pnpm v10+ or npm v10+
- **Python:** 3.11+ (Tested on Python 3.11.8)
- **Docker:** Optional (for containerized execution)

---

### Frontend Startup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
pnpm install # or npm install

# Start Vite development server
pnpm run dev # or npm run dev
```
The frontend will be available at: **http://localhost:5173**

---

### Backend Startup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
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

## 5. Verification & Testing

### Frontend Tests & Type Checking
```bash
cd frontend

# Run unit and component tests (Vitest)
pnpm test

# Run strict TypeScript validation
pnpm run typecheck

# Run production build check
pnpm run build
```

### Backend Tests
```bash
# Run Pytest suite
python -m pytest backend/tests -v
```

---

## 6. Data Integrity & Quarantine

All simulated telemetry records and event frames generated by this repository are tagged:
```json
"source": "simulated"
```
Simulations run within dedicated virtual sandbox boundaries (`ZONE-SANDBOX-DEMO`), guaranteeing zero pollution of real health analytics.

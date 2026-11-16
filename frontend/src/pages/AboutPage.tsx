import React from 'react'
import { PageContainer } from '@/components/layout/Containers'
import { SurfacePanel } from '@/components/ui/panels'
import { SectionHeading, DisplayHeading, BodyText } from '@/components/ui/typography'
import { StatusIndicator, SimulatedBadge } from '@/components/ui/status'
import { DetectorBoxLazy } from '@/three/DetectorBoxLazy'
import { SystemArchitectureDiagram } from '@/components/about/SystemArchitectureDiagram'
import {
  Cpu,
  Layers,
  AlertTriangle,
  Box,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react'

export const AboutPage: React.FC = () => {
  const hardwareSensors = [
    {
      name: 'Arduino Uno Rev3 (SMD / DIP)',
      role: 'Primary Microcontroller & SAR ADC',
      pins: 'Digital D0–D13, Analog A0–A5, 5V Reference',
      details:
        'ATmega328P clocked at 16 MHz with 10-bit Successive Approximation Register (SAR) ADC. Delivers integer conversions from 0 to 1023 counts (~4.8875 mV/LSB). No native wireless networking.',
    },
    {
      name: 'Bosch Sensortec BME280',
      role: 'Digital Environmental Ambient Sensor',
      pins: 'I2C Interface (SDA / SCL, Address 0x76)',
      details:
        'Precision digital telemetry for Ambient Temperature (-40 to +85°C), Relative Humidity (0 to 100%), and Atmospheric Pressure (300 to 1100 hPa). Emulated I2C dropout fault code (-999.0).',
    },
    {
      name: 'MQ-2 Gas Sensor',
      role: 'Smoke & Combustible Hydrocarbon Sensor',
      pins: 'Analog Pin A0 (0–5V Voltage Divider)',
      details:
        'Tin dioxide (SnO2) sensing layer sensitive to LPG, propane, methane, hydrogen, and dense smoke particles. Models non-linear voltage divider kinetics across 10 kΩ load resistor.',
    },
    {
      name: 'MQ-7 Gas Sensor',
      role: 'Carbon Monoxide (CO) Sensor',
      pins: 'Analog Pin A1 (0–5V Voltage Divider)',
      details:
        'Tuned specifically for Carbon Monoxide detection. Simulates thermal pre-heating coil warm-up dynamics, response onset delay, and slow asymmetric baseline recovery.',
    },
    {
      name: 'MQ-135 Gas Sensor',
      role: 'Air Quality & Volatile Gases Sensor',
      pins: 'Analog Pin A2 (0–5V Voltage Divider)',
      details:
        'Wide-spectrum air quality monitoring sensitive to ammonia, nitrogen oxides, alcohol, benzene, smoke, and CO2. Outputs uncalibrated raw relative ADC counts.',
    },
    {
      name: 'Infrared Optical Sensor',
      role: 'Optical Beam Break / Dust Occlusion Flag',
      pins: 'Digital Pin D2 (Active Low / High)',
      details:
        'Infrared optical emitter/detector pair providing a provisional digital state (0 = Clear optical path, 1 = Occluded / beam broken). Models high-density particulate flutter.',
    },
  ]

  const scenarios = [
    {
      id: 'scenario-01',
      name: 'Normal Day',
      tier: 'GREEN',
      desc: 'Baseline workplace environment with gentle diurnal temperature and humidity fluctuations. All gas sensors operate in clean safe bands.',
    },
    {
      id: 'scenario-02',
      name: 'Midday Heatwave',
      tier: 'ORANGE / RED',
      desc: 'Rapid escalation in ambient temperature up to 43.5°C accompanied by dry air (humidity dropping to 19%), driving heat strain tier transitions.',
    },
    {
      id: 'scenario-03',
      name: 'Humid Heat',
      tier: 'RED',
      desc: 'Dangerous combined heat and high humidity condition (36.2°C at 94% RH) where human evaporative sweat cooling becomes ineffective.',
    },
    {
      id: 'scenario-04',
      name: 'Smoke or Dust Episode',
      tier: 'RED',
      desc: 'Sudden localized smoke infiltration driving steep MQ-2 (780 ADC) and MQ-135 (690 ADC) spikes and intermittent optical IR beam fluttering.',
    },
    {
      id: 'scenario-05',
      name: 'Gas Leak Demo',
      tier: 'RED',
      desc: 'Simulated industrial emergency demonstration exhibiting an exponential Carbon Monoxide (MQ-7 > 850 ADC) spike with secondary combustible gas response.',
    },
    {
      id: 'scenario-06',
      name: 'Sensor Fault & Diagnostics',
      tier: 'FAULT',
      desc: 'Simulates hardware malfunctions, BME280 I2C bus lockup (-999.0), MQ-7 open-circuit pull-up (1023 ADC), and permanently stuck IR flag.',
    },
  ]

  const roadmapPhases = [
    { num: '0', title: 'Architecture Blueprint & Specifications', done: true },
    { num: '1', title: 'Frontend & Backend Foundation Scaffolding', done: true },
    { num: '2', title: 'Premium Design System & Visual Tokens', done: true },
    { num: '3', title: 'Hardware Product Landing Page & Hero Twin', done: true },
    { num: '4', title: 'Interactive 3D Procedural Detector Box Twin', done: true },
    { num: '5', title: 'Numerical Physics Engine & 10-Bit ADC Models', done: true },
    { num: '6', title: 'Real-Time WebSocket Streaming & Simulation Lab', done: true },
    { num: '7', title: 'Guided Demonstration & Judge Presentation Mode', done: true },
    { num: '8', title: 'System Architecture & Technical Reference', done: true },
    { num: '9', title: 'Comprehensive Verification, A11y & Performance', done: false },
    { num: '10', title: 'Isolated Bridge to Real ALLEVIA Backend', done: false },
    { num: '11', title: 'Final Hardening & Release Packaging', done: false },
  ]

  return (
    <div className="flex-1 py-10 sm:py-14">
      <PageContainer size="wide" className="space-y-16">
        {/* Section A: Project Introduction */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <StatusIndicator label="TECHNICAL DOCUMENTATION" variant="cyan" />
            <SimulatedBadge />
          </div>
          <DisplayHeading as="h1" className="text-3xl sm:text-4xl lg:text-5xl">
            System Architecture &amp; Hardware Twin
          </DisplayHeading>
          <BodyText className="text-base sm:text-lg leading-relaxed text-[var(--foreground-secondary)]">
            The <strong>ALLEVIA Environment Simulator</strong> is a standalone, interactive digital twin and telemetry
            emulation platform built for hackathon judges, technical reviewers, and clinical stakeholders. It provides
            deterministic, physics-grounded environmental simulations of the physical ALLEVIA Detector Box without
            requiring physical hardware on hand.
          </BodyText>
        </div>

        {/* Section B: Physical Detector Box & 3D Assembly */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <SectionHeading as="h2" className="flex items-center gap-2 text-xl">
                <Box className="w-5 h-5 text-[var(--accent-primary)]" />
                Physical Detector Box Assembly
              </SectionHeading>
              <p className="text-xs font-mono text-[var(--foreground-muted)] mt-1">
                PROCEDURAL THREE.JS / REACT THREE FIBER DIGITAL TWIN • 10 PIN INSPECTION POINTS
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 h-[480px] bg-black/40 border border-[var(--border-subtle)] rounded-2xl overflow-hidden relative">
              <DetectorBoxLazy exploded showCallouts />
            </div>

            <div className="lg:col-span-4 space-y-4">
              <SurfacePanel className="p-5 rounded-xl border border-[var(--border-subtle)] space-y-3">
                <h3 className="text-sm font-bold text-[var(--foreground-default)] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[var(--accent-primary)]" />
                  Hardware Inspection Highlights
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
                  Rotate, zoom, and inspect every component. Click on Drei 3D leader pins to view pinout mappings, voltage
                  divider schematics, and sensor roles.
                </p>
                <div className="text-[11px] font-mono space-y-1.5 pt-2 border-t border-[var(--border-subtle)] text-[var(--foreground-secondary)]">
                  <div>• Matte-black chassis with cyan LED perimeter</div>
                  <div>• ATmega328P 16MHz DIP-28 MCU</div>
                  <div>• MQ-2, MQ-7, MQ-135 MOS gas sensors</div>
                  <div>• Bosch BME280 I2C digital module</div>
                  <div>• Digital optical IR obstacle sensor</div>
                  <div>• Solid brass standoffs &amp; jumper wire harness</div>
                </div>
              </SurfacePanel>
            </div>
          </div>
        </div>

        {/* Section C: Sensor Technical Reference */}
        <div className="space-y-6">
          <SectionHeading as="h2" className="flex items-center gap-2 text-xl pb-3 border-b border-[var(--border-subtle)]">
            <Cpu className="w-5 h-5 text-[var(--accent-primary)]" />
            Verified Hardware Sensors &amp; Specifications
          </SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hardwareSensors.map((sensor) => (
              <SurfacePanel key={sensor.name} className="p-5 rounded-xl border border-[var(--border-subtle)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-primary)]">
                      {sensor.role}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
                      {sensor.pins.split(' ')[0]}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--foreground-default)] mb-1">{sensor.name}</h3>
                  <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{sensor.details}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]/50 text-[11px] font-mono text-[var(--foreground-subtle)]">
                  MAPPING: {sensor.pins}
                </div>
              </SurfacePanel>
            ))}
          </div>
        </div>

        {/* Section D & E: System Architecture & Data Flow */}
        <div className="space-y-6">
          <SectionHeading as="h2" className="flex items-center gap-2 text-xl pb-3 border-b border-[var(--border-subtle)]">
            <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
            End-to-End System Architecture &amp; Data Pipeline
          </SectionHeading>

          <SystemArchitectureDiagram />
        </div>

        {/* Section F: Technical Specifications */}
        <div className="space-y-6">
          <SectionHeading as="h2" className="flex items-center gap-2 text-xl pb-3 border-b border-[var(--border-subtle)]">
            <Terminal className="w-5 h-5 text-[var(--accent-primary)]" />
            Technical Stack &amp; Libraries Verified
          </SectionHeading>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <SurfacePanel className="p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
              <span className="text-[10px] uppercase text-[var(--accent-primary)] font-bold">FRONTEND CORE</span>
              <ul className="space-y-1 text-[var(--foreground-secondary)]">
                <li>• React 19 + TypeScript 5.8</li>
                <li>• Vite 6.4 + Tailwind CSS v4</li>
                <li>• React Router DOM v7</li>
                <li>• Zustand State Management</li>
              </ul>
            </SurfacePanel>

            <SurfacePanel className="p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
              <span className="text-[10px] uppercase text-[var(--accent-primary)] font-bold">3D GRAPHICS</span>
              <ul className="space-y-1 text-[var(--foreground-secondary)]">
                <li>• Three.js (r180+)</li>
                <li>• React Three Fiber v9</li>
                <li>• @react-three/drei v10</li>
                <li>• Custom Procedural Meshes</li>
              </ul>
            </SurfacePanel>

            <SurfacePanel className="p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
              <span className="text-[10px] uppercase text-[var(--accent-primary)] font-bold">BACKEND CORE</span>
              <ul className="space-y-1 text-[var(--foreground-secondary)]">
                <li>• Python 3.11+</li>
                <li>• FastAPI + Uvicorn</li>
                <li>• Pydantic v2 Validation</li>
                <li>• Asyncio WebSockets</li>
              </ul>
            </SurfacePanel>

            <SurfacePanel className="p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
              <span className="text-[10px] uppercase text-[var(--accent-primary)] font-bold">TESTING &amp; QUALITY</span>
              <ul className="space-y-1 text-[var(--foreground-secondary)]">
                <li>• Vitest + Testing Library</li>
                <li>• Pytest + Starlette TestClient</li>
                <li>• ESLint Strict Configuration</li>
                <li>• Zero Warning Quality Gates</li>
              </ul>
            </SurfacePanel>
          </div>
        </div>

        {/* Section G: Six Environmental Scenarios */}
        <div className="space-y-6">
          <SectionHeading as="h2" className="flex items-center gap-2 text-xl pb-3 border-b border-[var(--border-subtle)]">
            <Activity className="w-5 h-5 text-[var(--accent-primary)]" />
            The Six Environmental Simulation Scenarios
          </SectionHeading>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((sc) => (
              <SurfacePanel key={sc.id} className="p-4 rounded-xl border border-[var(--border-subtle)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[var(--foreground-default)]">{sc.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--accent-primary)]">
                      {sc.tier}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">{sc.desc}</p>
                </div>
              </SurfacePanel>
            ))}
          </div>
        </div>

        {/* Section H: Limitations & Regulatory Disclaimers */}
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-950/15 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            Limitations, Disclaimers &amp; Negative Hardware Scope
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-[var(--foreground-secondary)] leading-relaxed">
            <div>• All emitted telemetry packets are tagged with source="simulated".</div>
            <div>• MQ sensor analog ADC values are uncalibrated voltage divider demonstrations, not certified ppm.</div>
            <div>• The physical Arduino Uno has no built-in wireless networking.</div>
            <div>• The physical box contains NO PM2.5 laser sensors and NO black-globe probes.</div>
            <div>• Local simulated event classifications do not constitute medical diagnoses or workplace safety certifications.</div>
            <div>• No connection to the real ALLEVIA backend exists in this phase.</div>
          </div>
        </div>

        {/* Section I: Project Development Roadmap */}
        <div className="space-y-6">
          <SectionHeading as="h2" className="flex items-center gap-2 text-xl pb-3 border-b border-[var(--border-subtle)]">
            <Clock className="w-5 h-5 text-[var(--accent-primary)]" />
            Development Roadmap (Phase 0 through Phase 11)
          </SectionHeading>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {roadmapPhases.map((phase) => (
              <SurfacePanel
                key={phase.num}
                className={`p-3.5 rounded-xl border text-xs font-mono flex flex-col justify-between ${
                  phase.done
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-[var(--foreground-default)]">PHASE {phase.num}</span>
                  {phase.done ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> COMPLETED
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--foreground-subtle)]">PLANNED</span>
                  )}
                </div>
                <span className="text-[11px] text-[var(--foreground-muted)]">{phase.title}</span>
              </SurfacePanel>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  )
}

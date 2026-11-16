import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GuidedWalkthrough } from '@/components/lab/GuidedWalkthrough'
import { ScenarioComparison } from '@/components/lab/ScenarioComparison'
import { SimulationReportExport } from '@/components/lab/SimulationReportExport'
import { RecordedSimulationPlayback } from '@/components/lab/RecordedSimulationPlayback'
import { JudgePresentationModal } from '@/components/lab/JudgePresentationModal'
import type { TelemetryPacketData } from '@/types/telemetry'

// Mock 3D lazy component to simplify DOM testing
vi.mock('@/three/DetectorBoxLazy', () => ({
  DetectorBoxLazy: () => <div data-testid="presentation-detector-box">3D HARDWARE TWIN</div>,
}))

describe('Advanced Simulation Experience & Judge Demo Mode (Phase 7)', () => {
  it('renders guided demonstration walkthrough with step timeline and observation callouts', () => {
    render(<GuidedWalkthrough scenarioId="scenario-02" simTimeSec={85} />)

    expect(screen.getByText(/Guided Demonstration Mode/i)).toBeInTheDocument()
    expect(screen.getByText(/Midday Heatwave Walkthrough/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Advisory Threshold Breach/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Transition to YELLOW tier/i)).toBeInTheDocument()
  })

  it('renders scenario comparison benchmarks and calculates deltas', () => {
    const handleSelect = vi.fn()
    render(<ScenarioComparison onSelectScenario={handleSelect} />)

    const toggle = screen.getByText(/Scenario Comparative Benchmarks/i)
    fireEvent.click(toggle)

    expect(screen.getByText(/Normal Day vs Midday Heatwave/i)).toBeInTheDocument()
    expect(screen.getByText(/\+21.5°C rise/i)).toBeInTheDocument()
    expect(screen.getByText(/Normal Day vs Smoke\/Dust Episode/i)).toBeInTheDocument()
    expect(screen.getByText(/\+655 counts spike/i)).toBeInTheDocument()

    const loadButtons = screen.getAllByRole('button', { name: /Load/i })
    expect(loadButtons.length).toBeGreaterThanOrEqual(1)
    fireEvent.click(loadButtons[0])
    expect(handleSelect).toHaveBeenCalledWith('scenario-02')
  })

  it('renders simulation report export and aggregates statistics', () => {
    const dummyHistory: TelemetryPacketData[] = [
      {
        packet_id: 'PKT-1',
        session_id: 'sess-1',
        device_id: 'DEV-1',
        sequence_number: 1,
        timestamp: new Date().toISOString(),
        source: 'simulated',
        sim_time_sec: 1.0,
        readings: {
          bme280: { temperature_c: 25.0, humidity_pct: 50.0, pressure_hpa: 1013.0 },
          mq2_raw: 130,
          mq7_raw: 90,
          mq135_raw: 140,
          ir_state: 0,
          battery_voltage_v: 5.0,
        },
        simulated_tier: 'GREEN',
      },
      {
        packet_id: 'PKT-2',
        session_id: 'sess-1',
        device_id: 'DEV-1',
        sequence_number: 2,
        timestamp: new Date().toISOString(),
        source: 'simulated',
        sim_time_sec: 2.0,
        readings: {
          bme280: { temperature_c: 35.0, humidity_pct: 40.0, pressure_hpa: 1012.0 },
          mq2_raw: 200,
          mq7_raw: 150,
          mq135_raw: 220,
          ir_state: 0,
          battery_voltage_v: 5.0,
        },
        simulated_tier: 'YELLOW',
      },
    ]

    render(
      <SimulationReportExport
        sessionId="sess-test"
        scenarioId="scenario-02"
        simTimeSec={2.0}
        history={dummyHistory}
      />
    )

    const toggle = screen.getByText(/Simulation Run Report & Data Export/i)
    fireEvent.click(toggle)

    expect(screen.getByText(/30.0°C/i)).toBeInTheDocument() // avg of 25 and 35
    expect(screen.getByText(/Export CSV \(2 rows\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Export JSON/i)).toBeInTheDocument()
  })

  it('renders recorded simulation playback and triggers packet replay', () => {
    const dummyPackets: TelemetryPacketData[] = [
      {
        packet_id: 'REC-1',
        session_id: 'sess-rec',
        device_id: 'DEV-REC',
        sequence_number: 1,
        timestamp: new Date().toISOString(),
        source: 'simulated',
        sim_time_sec: 0.0,
        readings: {
          bme280: { temperature_c: 22.0, humidity_pct: 45.0, pressure_hpa: 1013.25 },
          mq2_raw: 120,
          mq7_raw: 95,
          mq135_raw: 150,
          ir_state: 0,
          battery_voltage_v: 5.0,
        },
        simulated_tier: 'GREEN',
      },
    ]

    const handleEmit = vi.fn()
    const handleExit = vi.fn()

    render(
      <RecordedSimulationPlayback
        recordedPackets={dummyPackets}
        onPacketEmit={handleEmit}
        onExitPlayback={handleExit}
      />
    )

    expect(screen.getByText(/RECORDED SIMULATION PLAYBACK/i)).toBeInTheDocument()
    expect(screen.getAllByText(/OFFLINE REPLAY/i).length).toBeGreaterThanOrEqual(1)

    const playBtn = screen.getByRole('button', { name: /Play Replay/i })
    fireEvent.click(playBtn)
    expect(handleEmit).toHaveBeenCalledWith(dummyPackets[0])

    const exitBtn = screen.getByRole('button', { name: /Exit Replay Mode/i })
    fireEvent.click(exitBtn)
    expect(handleExit).toHaveBeenCalled()
  })

  it('renders Judge Presentation Mode modal in fullscreen with key vital indicators', () => {
    const handleExit = vi.fn()
    const handlePlay = vi.fn()
    const handlePause = vi.fn()
    const handleReset = vi.fn()

    render(
      <JudgePresentationModal
        scenarioName="Midday Heatwave"
        simTimeSec={140}
        status="RUNNING"
        latestPacket={{
          packet_id: 'PKT-PRES-1',
          session_id: 'sess-pres',
          device_id: 'ALLEVIA-SIM-001',
          sequence_number: 140,
          timestamp: new Date().toISOString(),
          source: 'simulated',
          sim_time_sec: 140,
          readings: {
            bme280: { temperature_c: 38.5, humidity_pct: 22.0, pressure_hpa: 1009.0 },
            mq2_raw: 140,
            mq7_raw: 105,
            mq135_raw: 160,
            ir_state: 0,
            battery_voltage_v: 5.01,
          },
          simulated_tier: 'ORANGE',
          active_events: [
            {
              event_id: 'EVT-P1',
              timestamp: new Date().toISOString(),
              sim_time_sec: 140,
              severity: 'HIGH',
              event_category: 'THERMAL',
              triggering_sensor: 'BME280',
              observed_value: 38.5,
              threshold_value: 38.0,
              human_explanation: 'Elevated ambient temperature (38.5°C).',
              source: 'simulated',
            },
          ],
        }}
        onPlay={handlePlay}
        onPause={handlePause}
        onReset={handleReset}
        onExit={handleExit}
      />
    )

    expect(screen.getByText(/ALLEVIA Hardware Demonstration • Midday Heatwave/i)).toBeInTheDocument()
    expect(screen.getAllByText(/38.5°C/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/22%/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Elevated ambient temperature \(38.5°C\)/i)).toBeInTheDocument()
    expect(screen.getByTestId('presentation-detector-box')).toBeInTheDocument()

    const exitBtn = screen.getByRole('button', { name: /Exit Presentation Mode/i })
    fireEvent.click(exitBtn)
    expect(handleExit).toHaveBeenCalled()
  })
})

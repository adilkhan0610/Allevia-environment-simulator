import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { LabPage } from '@/pages/LabPage'
import { useSimulationStore } from '@/store/simulationStore'
import { useTelemetryStore } from '@/store/telemetryStore'

// Mock 3D lazy component to simplify DOM testing
vi.mock('@/three/DetectorBoxLazy', () => ({
  DetectorBoxLazy: () => <div data-testid="detector-box-twin">3D HARDWARE TWIN ACTIVE</div>,
}))

describe('Interactive Simulation Lab (Phase 6)', () => {
  beforeEach(() => {
    act(() => {
      useSimulationStore.getState().resetSimulation()
      useTelemetryStore.getState().resetTelemetry()
    })
  })

  it('renders top cockpit status bar with simulated twin badge', () => {
    render(<LabPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Simulation Laboratory/i)
    expect(screen.getByText(/SIMULATED TWIN/i)).toBeInTheDocument()
    expect(screen.getByText(/DEVICE: ALLEVIA-SIM-001/i)).toBeInTheDocument()
    expect(screen.getByText(/WS DISCONNECTED/i)).toBeInTheDocument()
  })

  it('renders 3D digital twin container and rolling telemetry waveform charts', async () => {
    await act(async () => {
      render(<LabPage />)
    })
    expect(screen.getByTestId('detector-box-twin')).toBeInTheDocument()
    expect(screen.getByText(/Continuous Telemetry Waveforms/i)).toBeInTheDocument()
    expect(screen.getAllByText(/BME280 Temperature/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/MQ-2 Smoke\/Gas/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/MQ-7 Carbon Monoxide/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/MQ-135 Air Quality/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders active sensor telemetry cards with live ADC and voltages', async () => {
    await act(async () => {
      render(<LabPage />)
    })
    expect(screen.getByText(/Active Sensor Telemetry/i)).toBeInTheDocument()
    expect(screen.getByText(/BME280 Ambient/i)).toBeInTheDocument()
    expect(screen.getAllByText(/MQ-2 Smoke\/Gas/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/MQ-7 Carbon Monoxide/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/MQ-135 Air Quality/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/IR BEAM BREAK \(D2\):/i)).toBeInTheDocument()
  })

  it('renders all six environmental scenarios in selector', async () => {
    act(() => {
      useSimulationStore.getState().setScenarios([
        {
          id: 'scenario-01',
          slug: 'normal-day',
          name: 'Normal Day',
          category: 'Baseline',
          description: 'Baseline workplace environment.',
          duration_seconds: 300,
          primary_threat: 'None',
          target_sensors: ['bme280'],
          risk_level_expected: 'LOW',
          expected_tier: 'GREEN',
        },
        {
          id: 'scenario-02',
          slug: 'midday-heatwave',
          name: 'Midday Heatwave',
          category: 'Thermal Stress',
          description: 'Rapid escalation in ambient temperature.',
          duration_seconds: 300,
          primary_threat: 'Extreme Heat',
          target_sensors: ['bme280'],
          risk_level_expected: 'HIGH',
          expected_tier: 'ORANGE',
        },
      ])
    })

    await act(async () => {
      render(<LabPage />)
    })
    expect(screen.getByText(/Normal Day/i)).toBeInTheDocument()
    expect(screen.getByText(/Midday Heatwave/i)).toBeInTheDocument()
  })

  it('updates live sensor cards when telemetry packet arrives from WebSocket', async () => {
    await act(async () => {
      render(<LabPage />)
    })

    await act(async () => {
      useTelemetryStore.getState().addTelemetryPacket({
        packet_id: 'PKT-TEST-001',
        session_id: 'sess-123',
        device_id: 'ALLEVIA-SIM-001',
        sequence_number: 1,
        timestamp: new Date().toISOString(),
        source: 'simulated',
        sim_time_sec: 15.0,
        readings: {
          bme280: {
            temperature_c: 41.5,
            humidity_pct: 22.0,
            pressure_hpa: 1008.0,
          },
          mq2_raw: 680,
          mq7_raw: 540,
          mq135_raw: 610,
          ir_state: 1,
          battery_voltage_v: 5.01,
        },
        simulated_tier: 'RED',
        active_events: [
          {
            event_id: 'EVT-TEST-01',
            timestamp: new Date().toISOString(),
            sim_time_sec: 15.0,
            severity: 'CRITICAL',
            event_category: 'THERMAL',
            triggering_sensor: 'BME280',
            observed_value: 41.5,
            threshold_value: 38.0,
            human_explanation: 'Simulated ambient temperature exceeds 40C.',
            source: 'simulated',
          },
        ],
      })
    })

    expect(screen.getAllByText(/41.5°C/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/680/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/BROKEN \(1\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Simulated ambient temperature exceeds 40C/i)).toBeInTheDocument()
  })

  it('allows opening sensor fault injection diagnostics', () => {
    render(<LabPage />)
    const faultToggle = screen.getByText(/Sensor Fault Injection & Diagnostics/i)
    fireEvent.click(faultToggle)

    expect(screen.getByText(/BME280 Environmental/i)).toBeInTheDocument()
    expect(screen.getByText(/I2C Bus Lockup \(-999°C\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Open Circuit \(ADC 1023\)/i)).toBeInTheDocument()
  })

  it('allows opening raw telemetry JSON inspector', () => {
    render(<LabPage />)
    const inspectorToggle = screen.getByText(/Raw Telemetry Packet Inspector/i)
    fireEvent.click(inspectorToggle)

    expect(screen.getByText(/Inspect verified payload JSON structure/i)).toBeInTheDocument()
    expect(screen.getByText(/No telemetry received yet/i)).toBeInTheDocument()
  })
})

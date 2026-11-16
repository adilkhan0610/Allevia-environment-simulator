import { describe, it, expect, beforeEach } from 'vitest'
import { useSimulationStore } from '@/store/simulationStore'
import { useTelemetryStore } from '@/store/telemetryStore'

describe('Zustand Modular Stores (Single-Screen Simulator)', () => {
  beforeEach(() => {
    useSimulationStore.getState().resetSimulation()
    useTelemetryStore.getState().resetTelemetry()
  })

  it('useSimulationStore initializes with correct defaults and updates status', () => {
    const store = useSimulationStore.getState()
    expect(store.status).toBe('IDLE')
    expect(store.source).toBe('simulated')
    expect(store.simulatedTier).toBe('GREEN')

    store.setStatus('RUNNING')
    expect(useSimulationStore.getState().status).toBe('RUNNING')

    store.setSpeedMultiplier(2.5)
    expect(useSimulationStore.getState().speedMultiplier).toBe(2.5)

    store.setIntensityMultiplier(1.8)
    expect(useSimulationStore.getState().intensityMultiplier).toBe(1.8)

    store.setSimulatedTier('RED')
    expect(useSimulationStore.getState().simulatedTier).toBe('RED')
  })

  it('useTelemetryStore handles telemetry packet and updates readings', () => {
    const store = useTelemetryStore.getState()
    expect(store.sequenceNumber).toBe(0)
    expect(store.connectionStatus).toBe('DISCONNECTED')

    store.setConnectionStatus('CONNECTED')
    expect(useTelemetryStore.getState().connectionStatus).toBe('CONNECTED')

    store.addTelemetryPacket({
      packet_id: 'test-packet-1',
      session_id: 'session-123',
      device_id: 'ALLEVIA-SIM-001',
      sequence_number: 1,
      timestamp: new Date().toISOString(),
      source: 'simulated',
      readings: {
        bme280: { temperature_c: 32.5, humidity_pct: 60.0, pressure_hpa: 1010.0 },
        mq2_raw: 450,
        mq7_raw: 300,
        mq135_raw: 400,
        ir_state: 1,
        battery_voltage_v: 5.0,
      },
      simulated_tier: 'YELLOW',
      sim_time_sec: 1.0,
    })

    const updated = useTelemetryStore.getState()
    expect(updated.sequenceNumber).toBe(1)
    expect(updated.readings.mq2_raw).toBe(450)
    expect(updated.readings.bme280.temperature_c).toBe(32.5)
    expect(updated.history.length).toBe(1)
  })
})

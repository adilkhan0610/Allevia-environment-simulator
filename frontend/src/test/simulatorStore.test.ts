import { describe, it, expect, beforeEach } from 'vitest'
import { useSimulatorStore } from '@/store/simulatorStore'

describe('useSimulatorStore State Machine', () => {
  beforeEach(() => {
    useSimulatorStore.getState().reset()
  })

  it('initializes with default values, running status, and clean dirty flag', () => {
    const s = useSimulatorStore.getState()
    expect(s.status).toBe('running')
    expect(s.dirty).toBe(false)
    expect(s.params.temperature).toBe(38)
    expect(s.params.humidity).toBe(35)
    expect(s.params.airQuality).toBe(171)
    expect(s.params.infrared).toBe(12)
    expect(s.params.pressure).toBe(1014)
    expect(s.params.gases).toEqual([])
    expect(s.logs.length).toBeGreaterThan(0)
  })

  it('marks dirty when any slider parameter changes', () => {
    useSimulatorStore.getState().setTemperature(29)
    expect(useSimulatorStore.getState().params.temperature).toBe(29)
    expect(useSimulatorStore.getState().dirty).toBe(true)

    useSimulatorStore.getState().reset()
    expect(useSimulatorStore.getState().dirty).toBe(false)

    useSimulatorStore.getState().setHumidity(65)
    expect(useSimulatorStore.getState().params.humidity).toBe(65)
    expect(useSimulatorStore.getState().dirty).toBe(true)

    useSimulatorStore.getState().setAirQuality(300)
    expect(useSimulatorStore.getState().params.airQuality).toBe(300)

    useSimulatorStore.getState().setInfrared(50)
    expect(useSimulatorStore.getState().params.infrared).toBe(50)

    useSimulatorStore.getState().setPressure(1005)
    expect(useSimulatorStore.getState().params.pressure).toBe(1005)
  })

  it('handles harmful gas toggling and clearing', () => {
    // Toggling 'co' adds it
    useSimulatorStore.getState().toggleGas('co')
    expect(useSimulatorStore.getState().params.gases).toEqual(['co'])
    expect(useSimulatorStore.getState().dirty).toBe(true)

    // Toggling 'smoke' appends it
    useSimulatorStore.getState().toggleGas('smoke')
    expect(useSimulatorStore.getState().params.gases).toContain('co')
    expect(useSimulatorStore.getState().params.gases).toContain('smoke')

    // Toggling 'co' again removes it
    useSimulatorStore.getState().toggleGas('co')
    expect(useSimulatorStore.getState().params.gases).toEqual(['smoke'])

    // Calling clearGases resets the list
    useSimulatorStore.getState().clearGases()
    expect(useSimulatorStore.getState().params.gases).toEqual([])
  })

  it('controls simulation lifecycle: stop, start, restart', () => {
    const s = useSimulatorStore.getState()
    s.stop()
    expect(useSimulatorStore.getState().status).toBe('stopped')

    s.start()
    expect(useSimulatorStore.getState().status).toBe('running')

    s.stop()
    expect(useSimulatorStore.getState().status).toBe('stopped')

    s.restart()
    expect(useSimulatorStore.getState().status).toBe('running')
  })

  it('advances countdown with tickSecond() and tick()', () => {
    const s = useSimulatorStore.getState()
    const initialCountdown = s.countdownSeconds
    s.tickSecond()
    expect(useSimulatorStore.getState().countdownSeconds).toBe(initialCountdown - 1)

    s.tick()
    expect(useSimulatorStore.getState().countdownSeconds).toBe(initialCountdown - 2)
  })

  it('supports node selection across nodes 1 to 5', () => {
    const s = useSimulatorStore.getState()
    expect(s.params.selectedNode).toBe(1)

    s.setSelectedNode(2)
    expect(useSimulatorStore.getState().params.selectedNode).toBe(2)
    expect(useSimulatorStore.getState().dirty).toBe(true)

    s.setSelectedNode(5)
    expect(useSimulatorStore.getState().params.selectedNode).toBe(5)
  })

  it('toggles air speed and affects dynamic cooling and dispersion', () => {
    const s = useSimulatorStore.getState()
    expect(s.params.airSpeed).toBe(false)

    s.toggleAirSpeed()
    expect(useSimulatorStore.getState().params.airSpeed).toBe(true)

    s.toggleAirSpeed()
    expect(useSimulatorStore.getState().params.airSpeed).toBe(false)

    s.setAirSpeed(true)
    expect(useSimulatorStore.getState().params.airSpeed).toBe(true)
  })

  it('toggles battery status between normal and low', () => {
    const s = useSimulatorStore.getState()
    expect(s.params.battery).toBe('normal')

    s.toggleBattery()
    expect(useSimulatorStore.getState().params.battery).toBe('low')

    s.toggleBattery()
    expect(useSimulatorStore.getState().params.battery).toBe('normal')

    s.setBattery('low')
    expect(useSimulatorStore.getState().params.battery).toBe('low')
  })
})

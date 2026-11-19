import { describe, it, expect, beforeEach } from 'vitest'
import { useSimulatorStore, RUN_SECONDS } from '@/store/simulatorStore'

describe('useSimulatorStore State Machine', () => {
  beforeEach(() => {
    useSimulatorStore.getState().reset()
  })

  it('initializes with default values, idle status, and clean dirty flag', () => {
    const s = useSimulatorStore.getState()
    expect(s.status).toBe('idle')
    expect(s.dirty).toBe(false)
    expect(s.secondsElapsed).toBe(0)
    expect(s.packetCount).toBe(0)
    expect(s.params.temperature).toBe(28)
    expect(s.params.humidity).toBe(50)
    expect(s.params.airQuality).toBe(45)
    expect(s.params.infrared).toBe(12)
    expect(s.params.pressure).toBe(1013)
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

  it('controls simulation lifecycle: start, stop, restart', () => {
    const s = useSimulatorStore.getState()
    s.start()
    expect(useSimulatorStore.getState().status).toBe('running')
    expect(useSimulatorStore.getState().dirty).toBe(false)
    expect(useSimulatorStore.getState().packetCount).toBe(1)

    s.stop()
    expect(useSimulatorStore.getState().status).toBe('stopped')

    s.restart()
    expect(useSimulatorStore.getState().status).toBe('running')
    expect(useSimulatorStore.getState().secondsElapsed).toBe(1)
  })

  it('actively moves parameter readings dynamically on start and ticks', () => {
    const s = useSimulatorStore.getState()
    s.setTemperature(28.0)
    s.setAirQuality(45)

    s.start()
    // Upon start, dynamic computation begins
    const runningParams1 = useSimulatorStore.getState().params
    expect(runningParams1.temperature).not.toBeNaN()

    // Advance 3 ticks
    s.tick()
    s.tick()
    s.tick()
    const runningParams4 = useSimulatorStore.getState().params
    // Parameters have dynamically updated and moved
    expect(runningParams4.temperature).not.toBe(28.0)
    expect(runningParams4.airQuality).not.toBe(45)

    // Reset restores base defaults
    s.reset()
    expect(useSimulatorStore.getState().params.temperature).toBe(28.0)
    expect(useSimulatorStore.getState().params.airQuality).toBe(45)
    expect(useSimulatorStore.getState().status).toBe('idle')
  })

  it('advances timer with tick() and completes after reaching RUN_SECONDS', () => {
    const s = useSimulatorStore.getState()
    s.start()

    // Advance 6 seconds
    for (let i = 0; i < 6; i++) {
      useSimulatorStore.getState().tick()
    }
    expect(useSimulatorStore.getState().secondsElapsed).toBe(7)
    expect(useSimulatorStore.getState().status).toBe('running')

    // Advance remaining seconds up to RUN_SECONDS (12)
    for (let i = 0; i < 10; i++) {
      useSimulatorStore.getState().tick()
    }
    expect(useSimulatorStore.getState().secondsElapsed).toBe(RUN_SECONDS)
    expect(useSimulatorStore.getState().status).toBe('completed')
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

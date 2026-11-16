import { create } from 'zustand'

export type SimStatus = 'idle' | 'running' | 'completed' | 'stopped'
export type GasType = 'co' | 'smoke' | 'lpg'

export const RUN_SECONDS = 12

export interface ParameterValues {
  temperature: number
  humidity: number
  airQuality: number
  infrared: number
  pressure: number
  gases: GasType[]
}

export interface SimulatorState {
  status: SimStatus
  dirty: boolean
  baseParams: ParameterValues
  params: ParameterValues
  secondsElapsed: number
  packetCount: number
  logs: string[]

  // Actions
  setTemperature: (v: number) => void
  setHumidity: (v: number) => void
  setAirQuality: (v: number) => void
  setInfrared: (v: number) => void
  setPressure: (v: number) => void
  toggleGas: (g: GasType) => void
  clearGases: () => void

  start: () => void
  stop: () => void
  restart: () => void
  tick: () => void
  reset: () => void
}

const DEFAULT_PARAMS: ParameterValues = {
  temperature: 28.0,
  humidity: 50,
  airQuality: 45,
  infrared: 12,
  pressure: 1013,
  gases: [],
}

const formatTimestamp = (sec: number) => {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `[${m}:${s}]`
}

/**
 * Computes realistic live sensor dynamics across the 12-second run
 */
function computeDynamicParams(base: ParameterValues, sec: number): ParameterValues {
  const t = Math.min(RUN_SECONDS, Math.max(1, sec))
  const hasSmoke = base.gases.includes('smoke')
  const hasCo = base.gases.includes('co')
  const hasLpg = base.gases.includes('lpg')

  // Temperature dynamics
  let tempDrift = Math.sin(t * 0.6) * 0.8 + Math.cos(t * 1.1) * 0.3
  if (hasSmoke) tempDrift += t * 0.35 + Math.sin(t * 0.9) * 0.4
  const temperature = Number(Math.min(60, Math.max(0, base.temperature + tempDrift)).toFixed(1))

  // Humidity dynamics
  let humDrift = Math.cos(t * 0.5) * 1.8
  if (hasSmoke) humDrift -= t * 0.4 + Math.sin(t * 0.6) * 1.2
  const humidity = Math.round(Math.min(100, Math.max(0, base.humidity + humDrift)))

  // Air Quality (MQ135) dynamics
  let aqiDrift = Math.sin(t * 0.8) * 5 + Math.cos(t * 1.4) * 3
  if (hasSmoke) aqiDrift += t * 28 + Math.sin(t * 1.3) * 6
  else if (hasCo) aqiDrift += t * 22 + Math.cos(t) * 5
  else if (hasLpg) aqiDrift += t * 20 + Math.sin(t * 1.5) * 6
  const airQuality = Math.round(Math.min(500, Math.max(0, base.airQuality + aqiDrift)))

  // Infrared dynamics
  let irDrift = Math.sin(t * 0.7) * 2.2
  if (hasSmoke) irDrift += t * 3.5 + Math.sin(t) * 3
  const infrared = Math.round(Math.min(100, Math.max(0, base.infrared + irDrift)))

  // Pressure dynamics
  const pressDrift = Math.sin(t * 0.4) * 0.8
  const pressure = Math.round(Math.min(1050, Math.max(950, base.pressure + pressDrift)))

  return {
    temperature,
    humidity,
    airQuality,
    infrared,
    pressure,
    gases: [...base.gases],
  }
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  status: 'idle',
  dirty: false,
  baseParams: { ...DEFAULT_PARAMS },
  params: { ...DEFAULT_PARAMS },
  secondsElapsed: 0,
  packetCount: 0,
  logs: ['[00:00] Device initialized. Waiting for start command.'],

  setTemperature: (temperature) =>
    set((state) => ({
      baseParams: { ...state.baseParams, temperature },
      params: { ...state.params, temperature },
      dirty: true,
    })),

  setHumidity: (humidity) =>
    set((state) => ({
      baseParams: { ...state.baseParams, humidity },
      params: { ...state.params, humidity },
      dirty: true,
    })),

  setAirQuality: (airQuality) =>
    set((state) => ({
      baseParams: { ...state.baseParams, airQuality },
      params: { ...state.params, airQuality },
      dirty: true,
    })),

  setInfrared: (infrared) =>
    set((state) => ({
      baseParams: { ...state.baseParams, infrared },
      params: { ...state.params, infrared },
      dirty: true,
    })),

  setPressure: (pressure) =>
    set((state) => ({
      baseParams: { ...state.baseParams, pressure },
      params: { ...state.params, pressure },
      dirty: true,
    })),

  toggleGas: (gas) =>
    set((state) => {
      const exists = state.baseParams.gases.includes(gas)
      const gases = exists
        ? state.baseParams.gases.filter((g) => g !== gas)
        : [...state.baseParams.gases, gas]
      return {
        baseParams: { ...state.baseParams, gases },
        params: { ...state.params, gases },
        dirty: true,
      }
    }),

  clearGases: () =>
    set((state) => ({
      baseParams: { ...state.baseParams, gases: [] },
      params: { ...state.params, gases: [] },
      dirty: true,
    })),

  start: () => {
    const { baseParams } = get()
    const packet = 1
    const ts = formatTimestamp(1)
    set({
      status: 'running',
      dirty: false,
      secondsElapsed: 1,
      packetCount: packet,
      params: computeDynamicParams(baseParams, 1),
      logs: [`${ts} packet ${packet} sent (200 OK)`],
    })
  },

  stop: () => {
    const { secondsElapsed, logs } = get()
    const ts = formatTimestamp(secondsElapsed)
    set({
      status: 'stopped',
      logs: [...logs.slice(-29), `${ts} transmission stopped by operator`],
    })
  },

  restart: () => {
    const { baseParams } = get()
    const packet = 1
    const ts = formatTimestamp(1)
    set({
      status: 'running',
      dirty: false,
      secondsElapsed: 1,
      packetCount: packet,
      params: computeDynamicParams(baseParams, 1),
      logs: [`${ts} packet ${packet} sent (200 OK)`],
    })
  },

  tick: () => {
    const { status, secondsElapsed, packetCount, logs, baseParams } = get()
    if (status !== 'running') return

    const nextSec = secondsElapsed + 1
    const nextPacket = packetCount + 1
    const ts = formatTimestamp(nextSec)
    const nextParams = computeDynamicParams(baseParams, nextSec)

    if (nextSec >= RUN_SECONDS) {
      set({
        status: 'completed',
        secondsElapsed: RUN_SECONDS,
        packetCount: nextPacket,
        params: nextParams,
        logs: [
          ...logs.slice(-28),
          `${ts} packet ${nextPacket} sent (200 OK)`,
          `${ts} Data sent successfully (${nextPacket} packets total)`,
        ],
      })
    } else {
      set({
        secondsElapsed: nextSec,
        packetCount: nextPacket,
        params: nextParams,
        logs: [...logs.slice(-29), `${ts} packet ${nextPacket} sent (200 OK)`],
      })
    }
  },

  reset: () =>
    set({
      status: 'idle',
      dirty: false,
      baseParams: { ...DEFAULT_PARAMS },
      params: { ...DEFAULT_PARAMS },
      secondsElapsed: 0,
      packetCount: 0,
      logs: ['[00:00] Device initialized. Waiting for start command.'],
    }),
}))

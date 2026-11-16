import { create } from 'zustand'
import type { SensorReadingsData, ConnectionStatus, TelemetryPacketData } from '@/types/telemetry'

interface TelemetryState {
  connectionStatus: ConnectionStatus
  sequenceNumber: number
  readings: SensorReadingsData
  history: TelemetryPacketData[]
  maxHistoryLength: number
  latencyMs: number

  setConnectionStatus: (status: ConnectionStatus) => void
  setLatencyMs: (ms: number) => void
  addTelemetryPacket: (packet: TelemetryPacketData) => void
  resetTelemetry: () => void
}

const initialReadings: SensorReadingsData = {
  bme280: {
    temperature_c: 24.2,
    humidity_pct: 48.5,
    pressure_hpa: 1013.25,
  },
  mq2_raw: 125,
  mq7_raw: 95,
  mq135_raw: 150,
  ir_state: 0,
  battery_voltage_v: 5.0,
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  connectionStatus: 'DISCONNECTED',
  sequenceNumber: 0,
  readings: initialReadings,
  history: [],
  maxHistoryLength: 60,
  latencyMs: 0,

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setLatencyMs: (latencyMs) => set({ latencyMs }),

  addTelemetryPacket: (packet) =>
    set((state) => ({
      sequenceNumber: packet.sequence_number,
      readings: packet.readings,
      history: [...state.history.slice(-(state.maxHistoryLength - 1)), packet],
    })),

  resetTelemetry: () =>
    set({
      sequenceNumber: 0,
      readings: initialReadings,
      history: [],
      latencyMs: 0,
    }),
}))

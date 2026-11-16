import { create } from 'zustand'
import type {
  SensorReadingsData,
  ConnectionStatus,
  TelemetryPacketData,
  SimulatedLocalEventData,
  DeviceHealthData,
} from '@/types/telemetry'

interface TelemetryState {
  connectionStatus: ConnectionStatus
  sequenceNumber: number
  readings: SensorReadingsData
  deviceHealth: DeviceHealthData | null
  activeEvents: SimulatedLocalEventData[]
  history: TelemetryPacketData[]
  maxHistoryLength: number
  latencyMs: number
  latestPacket: TelemetryPacketData | null

  setConnectionStatus: (status: ConnectionStatus) => void
  setLatencyMs: (ms: number) => void
  addTelemetryPacket: (packet: TelemetryPacketData) => void
  resetTelemetry: () => void
  clearHistory: () => void
}

const initialReadings: SensorReadingsData = {
  bme280: {
    temperature_c: 22.0,
    humidity_pct: 48.0,
    pressure_hpa: 1013.25,
  },
  mq2_raw: 125,
  mq7_raw: 95,
  mq135_raw: 150,
  ir_state: 0,
  battery_voltage_v: 5.0,
  mq2_details: {
    raw_adc: 125,
    voltage_v: 0.61,
    normalized_ratio: 0.122,
    is_warmed_up: true,
  },
  mq7_details: {
    raw_adc: 95,
    voltage_v: 0.46,
    normalized_ratio: 0.093,
    is_warmed_up: true,
  },
  mq135_details: {
    raw_adc: 150,
    voltage_v: 0.73,
    normalized_ratio: 0.147,
    is_warmed_up: true,
  },
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  connectionStatus: 'DISCONNECTED',
  sequenceNumber: 0,
  readings: initialReadings,
  deviceHealth: null,
  activeEvents: [],
  history: [],
  maxHistoryLength: 60,
  latencyMs: 0,
  latestPacket: null,

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setLatencyMs: (latencyMs) => set({ latencyMs }),

  addTelemetryPacket: (packet) =>
    set((state) => {
      // Duplicate protection: ignore if sequence number is older or identical to current, unless after reset
      if (
        state.sequenceNumber > 0 &&
        packet.sequence_number <= state.sequenceNumber &&
        packet.sequence_number !== 0
      ) {
        return state
      }

      return {
        sequenceNumber: packet.sequence_number,
        readings: packet.readings,
        deviceHealth: packet.device_health || state.deviceHealth,
        activeEvents: packet.active_events || [],
        latestPacket: packet,
        history: [...state.history.slice(-(state.maxHistoryLength - 1)), packet],
      }
    }),

  resetTelemetry: () =>
    set({
      sequenceNumber: 0,
      readings: initialReadings,
      deviceHealth: null,
      activeEvents: [],
      history: [],
      latencyMs: 0,
      latestPacket: null,
    }),

  clearHistory: () =>
    set({
      history: [],
    }),
}))

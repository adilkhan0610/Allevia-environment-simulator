import type { SimulatedTier } from './simulation'

export interface BME280Data {
  temperature_c: number
  humidity_pct: number
  pressure_hpa: number
}

export interface SensorReadingsData {
  bme280: BME280Data
  mq2_raw: number
  mq7_raw: number
  mq135_raw: number
  ir_state: number
  battery_voltage_v: number
}

export interface TelemetryPacketData {
  packet_id: string
  session_id: string
  device_id: string
  sequence_number: number
  timestamp: string
  source: 'simulated'
  readings: SensorReadingsData
  simulated_tier: SimulatedTier
  sim_time_sec: number
}

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'RECONNECTING'

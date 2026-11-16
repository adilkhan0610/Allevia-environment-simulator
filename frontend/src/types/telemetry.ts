import type { SimulatedTier } from './simulation'

export interface BME280Data {
  temperature_c: number
  humidity_pct: number
  pressure_hpa: number
}

export interface GasSensorDetailsData {
  raw_adc: number
  voltage_v: number
  normalized_ratio: number
  is_warmed_up: boolean
}

export interface SensorReadingsData {
  bme280: BME280Data
  mq2_raw: number
  mq7_raw: number
  mq135_raw: number
  ir_state: number
  battery_voltage_v: number
  mq2_details?: GasSensorDetailsData
  mq7_details?: GasSensorDetailsData
  mq135_details?: GasSensorDetailsData
}

export interface DeviceHealthData {
  is_connected: boolean
  health_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL_FAULT'
  uptime_sec: number
  all_warmed_up: boolean
}

export interface SimulatedLocalEventData {
  event_id: string
  timestamp: string
  sim_time_sec: number
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL'
  event_category: 'THERMAL' | 'SMOKE' | 'TOXIC_GAS' | 'AIR_QUALITY' | 'HARDWARE_FAULT' | 'OPTICAL'
  triggering_sensor: string
  observed_value: number
  threshold_value: number
  human_explanation: string
  source: 'simulated'
}

export interface TelemetryPacketData {
  schema_version?: string
  packet_id: string
  session_id: string
  device_id: string
  sequence_number: number
  timestamp: string
  source: 'simulated'
  scenario_id?: string
  sim_time_sec: number
  readings: SensorReadingsData
  device_health?: DeviceHealthData
  simulated_tier: SimulatedTier
  active_events?: SimulatedLocalEventData[]
}

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'RECONNECTING'

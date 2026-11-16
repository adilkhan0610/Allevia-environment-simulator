import type { ScenarioMetadata } from './simulation'

export interface ApiErrorResponse {
  error: string
  message: string
  detail?: string
}

export interface ScenarioListApiResponse {
  total: number
  scenarios: ScenarioMetadata[]
}

export interface SessionCreateApiRequest {
  scenario_id?: string
  device_id?: string
  speed_multiplier?: number
  intensity_multiplier?: number
}

export interface SessionDeleteApiResponse {
  session_id: string
  deleted: boolean
  message: string
}

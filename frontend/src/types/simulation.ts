export type SimulationStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'TERMINATED'

export type SimulatedTier = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED' | 'FAULT'

export interface ScenarioMetadata {
  id: string
  slug: string
  name: string
  category: string
  description: string
  duration_seconds: number
  primary_threat: string
  target_sensors: string[]
  risk_level_expected: string
  expected_tier?: string
}

export interface SimulationSession {
  session_id: string
  device_id: string
  created_at: string
  expires_at: string
  status: SimulationStatus
  source: 'simulated'
  selected_scenario: string
  speed_multiplier: number
  intensity_multiplier: number
}

import { create } from 'zustand'
import type { SimulationStatus, SimulatedTier, ScenarioMetadata } from '@/types/simulation'

interface SimulationState {
  // Session & Identity
  sessionId: string | null
  deviceId: string
  source: 'simulated'

  // Control Parameters
  status: SimulationStatus
  speedMultiplier: number
  intensityMultiplier: number
  simTimeSec: number

  // Scenario Management
  selectedScenarioId: string
  scenarios: ScenarioMetadata[]

  // Local Evaluated Tier
  simulatedTier: SimulatedTier

  // Actions
  setSession: (sessionId: string, deviceId: string) => void
  clearSession: () => void
  setStatus: (status: SimulationStatus) => void
  setSpeedMultiplier: (speed: number) => void
  setIntensityMultiplier: (intensity: number) => void
  setSimTimeSec: (time: number) => void
  setSelectedScenarioId: (scenarioId: string) => void
  setScenarios: (scenarios: ScenarioMetadata[]) => void
  setSimulatedTier: (tier: SimulatedTier) => void
  resetSimulation: () => void
}

export const DEFAULT_SCENARIOS: ScenarioMetadata[] = [
  {
    id: 'scenario-01',
    slug: 'normal-day',
    name: 'Normal Day',
    category: 'Baseline',
    description: 'Baseline workplace environment with gentle fluctuations.',
    duration_seconds: 300,
    primary_threat: 'None',
    target_sensors: ['bme280'],
    risk_level_expected: 'LOW',
    expected_tier: 'GREEN',
  },
  {
    id: 'scenario-02',
    slug: 'midday-heatwave',
    name: 'Midday Heatwave',
    category: 'Thermal Stress',
    description: 'Rapid temperature escalation up to 43.5°C.',
    duration_seconds: 300,
    primary_threat: 'Extreme Heat',
    target_sensors: ['bme280'],
    risk_level_expected: 'HIGH',
    expected_tier: 'ORANGE',
  },
  {
    id: 'scenario-03',
    slug: 'humid-heat',
    name: 'Humid Heat',
    category: 'Thermal Stress',
    description: 'Dangerous combined high heat and 94% humidity.',
    duration_seconds: 300,
    primary_threat: 'Humid Heat',
    target_sensors: ['bme280'],
    risk_level_expected: 'CRITICAL',
    expected_tier: 'RED',
  },
  {
    id: 'scenario-04',
    slug: 'smoke-dust',
    name: 'Smoke Episode',
    category: 'Air Quality',
    description: 'Sudden smoke infiltration driving MQ-2 spike.',
    duration_seconds: 300,
    primary_threat: 'Dense Smoke',
    target_sensors: ['mq2', 'ir'],
    risk_level_expected: 'HIGH',
    expected_tier: 'RED',
  },
  {
    id: 'scenario-05',
    slug: 'gas-leak',
    name: 'Gas Leak Demo',
    category: 'Chemical Hazard',
    description: 'Carbon monoxide escalation driving MQ-7 spike.',
    duration_seconds: 300,
    primary_threat: 'Carbon Monoxide',
    target_sensors: ['mq7', 'mq2'],
    risk_level_expected: 'CRITICAL',
    expected_tier: 'RED',
  },
  {
    id: 'scenario-06',
    slug: 'sensor-fault',
    name: 'Sensor Faults',
    category: 'Diagnostics',
    description: 'Hardware anomalies, I2C bus lockup and pull-ups.',
    duration_seconds: 300,
    primary_threat: 'Hardware Failure',
    target_sensors: ['bme280', 'mq7', 'ir'],
    risk_level_expected: 'HIGH',
    expected_tier: 'FAULT',
  },
]

export const useSimulationStore = create<SimulationState>((set) => ({
  sessionId: null,
  deviceId: 'ALLEVIA-SIM-001',
  source: 'simulated',

  status: 'IDLE',
  speedMultiplier: 1.0,
  intensityMultiplier: 1.0,
  simTimeSec: 0,

  selectedScenarioId: 'scenario-01',
  scenarios: DEFAULT_SCENARIOS,

  simulatedTier: 'GREEN',

  setSession: (sessionId, deviceId) => set({ sessionId, deviceId }),
  clearSession: () => set({ sessionId: null, status: 'IDLE', simTimeSec: 0 }),
  setStatus: (status) => set({ status }),
  setSpeedMultiplier: (speedMultiplier) => set({ speedMultiplier }),
  setIntensityMultiplier: (intensityMultiplier) => set({ intensityMultiplier }),
  setSimTimeSec: (simTimeSec) => set({ simTimeSec }),
  setSelectedScenarioId: (selectedScenarioId) => set({ selectedScenarioId }),
  setScenarios: (scenarios) => set({ scenarios }),
  setSimulatedTier: (simulatedTier) => set({ simulatedTier }),
  resetSimulation: () => set({
    status: 'IDLE',
    simTimeSec: 0,
    simulatedTier: 'GREEN',
  }),
}))

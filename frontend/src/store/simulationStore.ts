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

export const useSimulationStore = create<SimulationState>((set) => ({
  sessionId: null,
  deviceId: 'ALLEVIA-SIM-001',
  source: 'simulated',

  status: 'IDLE',
  speedMultiplier: 1.0,
  intensityMultiplier: 1.0,
  simTimeSec: 0,

  selectedScenarioId: 'scenario-01',
  scenarios: [],

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

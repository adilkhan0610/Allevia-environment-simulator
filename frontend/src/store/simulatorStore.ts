import { create } from 'zustand'
import {
  SIMULATION_CADENCE_SECONDS,
  UAE_NOVEMBER_BASELINES,
  ZONE_ALERT_READINGS,
  RESERVED_HARDWARE_NODE_ID,
  stepNormalVariation,
  stepSpikeDecay,
  type NodeMetrics,
  type OverrideState,
  POPULATION_API_BASE,
  POPULATION_DEVICE_KEY,
} from '@/services/simulationNetwork'

export type SimStatus = 'idle' | 'running' | 'completed' | 'stopped'
export type ScenarioLevel = 'elevated' | 'alert'
export type GasType = 'co' | 'smoke' | 'lpg'
export type NodeNumber = 1 | 2 | 3 | 4 | 5
export type BatteryStatus = 'normal' | 'low'

export const RUN_SECONDS = 60

export interface NodeProfile {
  id: NodeNumber
  nodeId: string
  siteId: string
  zone: string
  zoneName: string
  label: string
}

export const NODE_PROFILES: Record<NodeNumber, NodeProfile> = {
  1: { id: 1, nodeId: 'N01', siteId: 'S13', zone: 'A', zoneName: 'Mussafah Industrial Area', label: 'Node 1 — Zone A (Mussafah)' },
  2: { id: 2, nodeId: 'N02', siteId: 'S03', zone: 'B', zoneName: 'Industrial City of Abu Dhabi (ICAD)', label: 'Node 2 — Zone B (ICAD)' },
  3: { id: 3, nodeId: 'N03', siteId: 'S17', zone: 'C', zoneName: 'KEZAD Al Taweelah', label: 'Node 3 — Zone C (KEZAD)' },
  4: { id: 4, nodeId: 'N04', siteId: 'S20', zone: 'D', zoneName: 'Zayed Port (Mina Zayed)', label: 'Node 4 — Zone D (Zayed Port)' },
  5: { id: 5, nodeId: 'N05', siteId: 'S22', zone: 'E', zoneName: 'Al Mafraq Workers Residential City', label: 'Node 5 — Zone E (Al Mafraq)' },
}

export interface ParameterValues {
  temperature: number
  humidity: number
  airQuality: number // AQI (0-500)
  infrared: number
  pressure: number
  gases: GasType[]
  airSpeed: boolean // false = Calm (0.2 m/s), true = High Airflow / Wind (4.5 m/s)
  battery: BatteryStatus // 'normal' (95%) | 'low' (14%)
  charging?: boolean // toggle to charge battery
  selectedNode: NodeNumber // 1 | 2 | 3 | 4 | 5
}

export interface NodeRuntimeState {
  nodeId: string
  siteId: string
  zone: string
  zoneName: string
  baseline: NodeMetrics
  current: NodeMetrics
  override: OverrideState | null
  lastSentPayload: any | null
}

export interface SimulatorState {
  status: SimStatus
  scenarioLevel: ScenarioLevel
  dirty: boolean
  baseParams: ParameterValues
  params: ParameterValues
  secondsElapsed: number
  packetCount: number
  logs: string[]

  // Live 60s Sensor Network
  countdownSeconds: number
  nodeStates: Record<string, NodeRuntimeState>
  lastSentPayload: any | null
  totalNetworkTransmissions: number
  reservedHardwareNodeId: string | null

  // Actions
  setTemperature: (v: number) => void
  setHumidity: (v: number) => void
  setAirQuality: (v: number) => void
  setInfrared: (v: number) => void
  setPressure: (v: number) => void
  toggleGas: (g: GasType) => void
  clearGases: () => void
  toggleAirSpeed: () => void
  setAirSpeed: (v: boolean) => void
  toggleBattery: () => void
  setBattery: (v: BatteryStatus) => void
  toggleCharging: () => void
  setSelectedNode: (node: NodeNumber) => void

  start: () => void
  stop: () => void
  restart: () => void
  tickSecond: () => void
  tick: () => void
  dispatchNetworkCycle: () => Promise<void>
  triggerImmediateSpike: () => Promise<void>
  reset: () => void
}

const DEFAULT_PARAMS: ParameterValues = {
  temperature: 38.0,
  humidity: 35,
  airQuality: 171,
  infrared: 12,
  pressure: 1014,
  gases: [],
  airSpeed: false,
  battery: 'normal',
  charging: false,
  selectedNode: 1,
}

function initializeNodeStates(): Record<string, NodeRuntimeState> {
  const result: Record<string, NodeRuntimeState> = {}
  for (const [nid, cfg] of Object.entries(UAE_NOVEMBER_BASELINES)) {
    result[nid] = {
      nodeId: cfg.nodeId,
      siteId: cfg.siteId,
      zone: cfg.zone,
      zoneName: cfg.zoneName,
      baseline: { ...cfg.baseline },
      current: { ...cfg.baseline },
      override: null,
      lastSentPayload: null,
    }
  }
  return result
}

function sendPacketDirect(payload: any): Promise<boolean> {
  return fetch(`${POPULATION_API_BASE}/api/v1/ingest/readings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Node-Id': payload.node_id,
      'X-Device-Key': POPULATION_DEVICE_KEY,
    },
    body: JSON.stringify(payload),
  })
    .then((res) => res.ok)
    .catch(() => false)
}

function broadcastSync(payload: any) {
  try {
    const syncChannel = new BroadcastChannel('allevia-simulation-sync')
    syncChannel.postMessage({
      type: 'TELEMETRY_UPDATE',
      node: {
        nodeId: payload.node_id,
        siteId: payload.site_id,
        zone: payload.zone,
      },
      readings: {
        air_c: payload.air_c,
        rh_pct: payload.rh_pct,
        pm25: payload.pm25,
        globe_c: payload.globe_c,
        battery_pct: payload.battery_pct,
        pressure_hpa: payload.pressure_hpa,
      },
      timestamp: payload.ts,
    })
    setTimeout(() => syncChannel.close(), 1000)
  } catch {}

  try {
    const syncData = JSON.stringify({
      zone: payload.zone,
      nodeId: payload.node_id,
      air_c: payload.air_c,
      rh_pct: payload.rh_pct,
      pm25: payload.pm25,
      globe_c: payload.globe_c,
      battery_pct: payload.battery_pct,
      ts: Date.now(),
    })
    localStorage.setItem(`allevia_node_sync_${payload.zone}`, syncData)
    localStorage.setItem(`allevia_node_sync_${payload.node_id}`, syncData)
  } catch {}
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  status: 'running',
  scenarioLevel: 'elevated',
  dirty: false,
  baseParams: { ...DEFAULT_PARAMS },
  params: { ...DEFAULT_PARAMS },
  secondsElapsed: 0,
  packetCount: 0,
  logs: ['[00:00] Live sensor network initialized. Autonomous 60s cadence active.'],

  countdownSeconds: SIMULATION_CADENCE_SECONDS,
  nodeStates: initializeNodeStates(),
  lastSentPayload: null,
  totalNetworkTransmissions: 0,
  reservedHardwareNodeId: RESERVED_HARDWARE_NODE_ID,

  setTemperature: (temperature) =>
    set((state) => ({
      params: { ...state.params, temperature },
      dirty: true,
    })),

  setHumidity: (humidity) =>
    set((state) => ({
      params: { ...state.params, humidity },
      dirty: true,
    })),

  setAirQuality: (airQuality) =>
    set((state) => ({
      params: { ...state.params, airQuality },
      dirty: true,
    })),

  setInfrared: (infrared) =>
    set((state) => ({
      params: { ...state.params, infrared },
      dirty: true,
    })),

  setPressure: (pressure) =>
    set((state) => ({
      params: { ...state.params, pressure },
      dirty: true,
    })),

  toggleGas: (gas) =>
    set((state) => {
      const exists = state.params.gases.includes(gas)
      const gases = exists
        ? state.params.gases.filter((g) => g !== gas)
        : [...state.params.gases, gas]
      return {
        params: { ...state.params, gases },
        dirty: true,
      }
    }),

  clearGases: () =>
    set((state) => ({
      params: { ...state.params, gases: [] },
      dirty: true,
    })),

  toggleAirSpeed: () =>
    set((state) => ({
      params: { ...state.params, airSpeed: !state.params.airSpeed },
      dirty: true,
    })),

  setAirSpeed: (airSpeed) =>
    set((state) => ({
      params: { ...state.params, airSpeed },
      dirty: true,
    })),

  toggleBattery: () =>
    set((state) => {
      const next = state.params.battery === 'normal' ? 'low' : 'normal'
      return {
        params: { ...state.params, battery: next },
        dirty: true,
      }
    }),

  setBattery: (battery) =>
    set((state) => ({
      params: { ...state.params, battery },
      dirty: true,
    })),

  toggleCharging: () =>
    set((state) => ({
      params: { ...state.params, charging: !state.params.charging },
      dirty: true,
    })),

  setSelectedNode: (selectedNode) =>
    set((state) => {
      const nid = NODE_PROFILES[selectedNode]?.nodeId
      const target = state.nodeStates[nid]?.current
      return {
        params: target
          ? {
              ...state.params,
              selectedNode,
              temperature: target.air_c,
              humidity: target.rh_pct,
              airQuality: target.aqi,
              pressure: Math.round(target.pressure_hpa),
            }
          : { ...state.params, selectedNode },
        dirty: true,
      }
    }),

  start: () => {
    set({ status: 'running' })
    get().triggerImmediateSpike()
  },

  stop: () => {
    set((state) => ({
      status: 'stopped',
      logs: [...state.logs.slice(-29), `[${new Date().toLocaleTimeString()}] Network simulation paused by operator`],
    }))
  },

  restart: () => {
    set({ status: 'running' })
    get().triggerImmediateSpike()
  },

  // 1-second interval ticker for countdown and background simulation
  tickSecond: () => {
    const { status, countdownSeconds } = get()
    if (status !== 'running') return

    if (countdownSeconds <= 1) {
      set({ countdownSeconds: SIMULATION_CADENCE_SECONDS })
      get().dispatchNetworkCycle()
    } else {
      set({ countdownSeconds: countdownSeconds - 1 })
    }
  },
  tick: () => {
    get().tickSecond()
  },

  // Dispatches readings for every node (N01-N05) every 60s
  dispatchNetworkCycle: async () => {
    const { nodeStates, reservedHardwareNodeId, logs, totalNetworkTransmissions, scenarioLevel } = get()
    const nextStates = { ...nodeStates }
    const tsStr = new Date().toISOString()
    let lastPayload: any = null
    const cycleLogs: string[] = []

    for (const [nid, node] of Object.entries(nextStates)) {
      if (reservedHardwareNodeId && nid === reservedHardwareNodeId) {
        continue // Skip hardware node
      }

      // Base target for this cycle based on scenarioLevel
      const baseTarget = scenarioLevel === 'alert'
        ? (ZONE_ALERT_READINGS[nid] || node.baseline)
        : node.baseline

      let updatedMetrics: NodeMetrics
      let updatedOverride: OverrideState | null = node.override

      if (node.override) {
        // Apply exponential decay if custom override
        const step = stepSpikeDecay(node.current, baseTarget, node.override)
        updatedMetrics = step.nextMetrics
        updatedOverride = step.nextOverride
      } else {
        // Natural bounded random walk around target baseline
        updatedMetrics = stepNormalVariation(node.current, baseTarget)
      }

      const payload = {
        schema: 1,
        node_id: node.nodeId,
        site_id: node.siteId,
        zone: node.zone,
        ts: tsStr,
        air_c: updatedMetrics.air_c,
        rh_pct: updatedMetrics.rh_pct,
        pressure_hpa: updatedMetrics.pressure_hpa,
        pm25: updatedMetrics.pm25,
        globe_c: updatedMetrics.globe_c,
        battery_pct: updatedMetrics.battery_pct,
        mq2_adc: updatedMetrics.mq2_adc,
        mq3_adc: updatedMetrics.mq3_adc,
        mq135_adc: updatedMetrics.mq135_adc,
        flame_ir_detected: updatedMetrics.flame_ir_detected,
        buffered: false,
      }

      lastPayload = payload
      sendPacketDirect(payload)
      broadcastSync(payload)

      nextStates[nid] = {
        ...node,
        current: updatedMetrics,
        override: updatedOverride,
        lastSentPayload: payload,
      }

      cycleLogs.push(`${node.nodeId} (Zone ${node.zone}): PM2.5=${updatedMetrics.pm25} µg/m³, WBGT=${updatedMetrics.wbgt_c}°C [${scenarioLevel.toUpperCase()}]`)
    }

    const timeLabel = new Date().toLocaleTimeString('en-GB')
    set({
      nodeStates: nextStates,
      lastSentPayload: lastPayload,
      totalNetworkTransmissions: totalNetworkTransmissions + 1,
      logs: [
        ...logs.slice(-25),
        `[${timeLabel}] 60s Cycle dispatched for all nodes (${Object.keys(nextStates).length} packets) [${scenarioLevel.toUpperCase()}]:`,
        ...cycleLogs.slice(0, 4).map((l) => `  ↳ ${l}`),
      ],
    })
  },

  // Trigger button toggles between ELEVATED and ALERT for all zones in upcoming minute cycle
  triggerImmediateSpike: async () => {
    const { scenarioLevel, nodeStates, params, logs } = get()
    const nextLevel: ScenarioLevel = scenarioLevel === 'elevated' ? 'alert' : 'elevated'

    // Update all nodes' current metrics immediately to match target level
    const nextStates = { ...nodeStates }
    for (const [nid, node] of Object.entries(nextStates)) {
      const targetMetrics = nextLevel === 'alert'
        ? { ...(ZONE_ALERT_READINGS[nid] || node.baseline) }
        : { ...node.baseline }

      nextStates[nid] = {
        ...node,
        current: targetMetrics,
        override: null,
      }
    }

    // Sync parameters panel sliders for currently selected node
    const targetNodeId = NODE_PROFILES[params.selectedNode]?.nodeId || 'N01'
    const selMetrics = nextStates[targetNodeId]?.current || nextStates['N01'].current

    set({
      scenarioLevel: nextLevel,
      dirty: false,
      nodeStates: nextStates,
      params: {
        ...params,
        temperature: selMetrics.air_c,
        humidity: selMetrics.rh_pct,
        airQuality: selMetrics.aqi,
        pressure: Math.round(selMetrics.pressure_hpa),
      },
      logs: [
        ...logs.slice(-27),
        `[${new Date().toLocaleTimeString()}] Trigger activated: All zones (A, B, C, D) set to ${nextLevel.toUpperCase()} level.`,
        `  ↳ Updated readings will be dispatched simultaneously across all zones on the upcoming 60s minute cycle.`,
      ],
    })
  },

  reset: () => {
    set({
      status: 'running',
      dirty: false,
      scenarioLevel: 'elevated',
      baseParams: { ...DEFAULT_PARAMS },
      params: { ...DEFAULT_PARAMS },
      countdownSeconds: SIMULATION_CADENCE_SECONDS,
      nodeStates: initializeNodeStates(),
      logs: ['[00:00] Device values and network telemetry reset to ELEVATED scenario baselines.'],
    })
  },
}))

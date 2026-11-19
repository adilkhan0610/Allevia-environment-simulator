import React from 'react'
import {
  useSimulatorStore,
  type GasType,
  type NodeNumber,
  NODE_PROFILES,
} from '@/store/simulatorStore'
import { apiClient } from '@/services/apiClient'

interface GasOption {
  id: GasType | 'none'
  label: string
}

const GAS_OPTIONS: GasOption[] = [
  { id: 'co', label: 'Carbon monoxide (CO)' },
  { id: 'smoke', label: 'Smoke' },
  { id: 'lpg', label: 'LPG / flammable gas' },
  { id: 'none', label: 'None' },
]

export const ParametersPanel: React.FC = () => {
  const params = useSimulatorStore((s) => s.params)
  const setTemperature = useSimulatorStore((s) => s.setTemperature)
  const setHumidity = useSimulatorStore((s) => s.setHumidity)
  const setAirQuality = useSimulatorStore((s) => s.setAirQuality)
  const setInfrared = useSimulatorStore((s) => s.setInfrared)
  const setPressure = useSimulatorStore((s) => s.setPressure)
  const toggleGas = useSimulatorStore((s) => s.toggleGas)
  const clearGases = useSimulatorStore((s) => s.clearGases)
  const toggleAirSpeed = useSimulatorStore((s) => s.toggleAirSpeed)
  const toggleBattery = useSimulatorStore((s) => s.toggleBattery)
  const toggleCharging = useSimulatorStore((s) => s.toggleCharging)
  const setSelectedNode = useSimulatorStore((s) => s.setSelectedNode)

  const isNoneSelected = params.gases.length === 0
  const currentNode = NODE_PROFILES[params.selectedNode] || NODE_PROFILES[1]

  const handleNodeChange = async (nodeNum: NodeNumber) => {
    setSelectedNode(nodeNum)
    try {
      await apiClient.setIntegrationNode(nodeNum)
    } catch {
      // Backend may be offline or in standalone mode
    }
  }

  return (
    <div className="w-full h-full flex flex-col justify-between p-3.5 sm:p-4 bg-[var(--surface)] text-[var(--foreground)] rounded-[16px] border border-[var(--border)] shadow-[var(--shadow-panel)] overflow-y-auto text-[13px] transition-colors scrollbar-thin">
      <div className="space-y-3">
        {/* Node Selection Dropdown */}
        <div className="space-y-1.5 pb-2.5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <span className="text-[var(--foreground)] font-semibold text-[12px] tracking-tight">
              Target Node
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--surface-hover)] text-[var(--secondary)] border border-[var(--border)]">
              Zone {currentNode.zone} · {currentNode.nodeId}
            </span>
          </div>
          <select
            value={params.selectedNode}
            onChange={(e) => handleNodeChange(Number(e.target.value) as NodeNumber)}
            aria-label="Select target node"
            className="w-full bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] rounded-[8px] px-2.5 py-1.5 font-medium text-[12px] cursor-pointer outline-none focus:ring-1 focus:ring-[var(--foreground)] transition-colors"
          >
            <option value={1}>Node 1 — Zone A (Mussafah Industrial)</option>
            <option value={2}>Node 2 — Zone B (ICAD Manufacturing)</option>
            <option value={3}>Node 3 — Zone C (KEZAD Al Taweelah)</option>
            <option value={4}>Node 4 — Zone D (Zayed Port)</option>
            <option value={5}>Node 5 — Zone E (Al Mafraq Workers City)</option>
          </select>
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-0.5">
            <span>Site {currentNode.siteId}</span>
            <span className="text-emerald-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Affects Population Zones
            </span>
          </div>
        </div>

        {/* Toggles: Air Speed & Battery */}
        <div className="space-y-2 pb-2.5 border-b border-[var(--border-subtle)]">
          {/* Air Speed Toggle */}
          <div className="flex items-center justify-between py-0.5">
            <div>
              <div className="text-[var(--foreground)] font-medium text-[12px]">Air speed</div>
              <div className="text-[11px] text-[var(--secondary)]">
                {params.airSpeed ? 'High airflow (4.5 m/s)' : 'Calm air (0.2 m/s)'}
              </div>
            </div>
            <button
              type="button"
              onClick={toggleAirSpeed}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                params.airSpeed ? 'bg-sky-500' : 'bg-[var(--border)]'
              }`}
              role="switch"
              aria-checked={params.airSpeed}
              aria-label="Toggle air speed"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  params.airSpeed ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Battery Toggle */}
          <div className="flex items-center justify-between py-0.5">
            <div>
              <div className="text-[var(--foreground)] font-medium text-[12px]">Battery status</div>
              <div className="text-[11px] text-[var(--secondary)]">
                {params.battery === 'normal' ? 'Normal (95% · 5.0V)' : 'Low power (14% · 3.4V)'}
              </div>
            </div>
            <button
              type="button"
              onClick={toggleBattery}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                params.battery === 'normal' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              role="switch"
              aria-checked={params.battery === 'normal'}
              aria-label="Toggle battery status"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  params.battery === 'normal' ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Charging Toggle */}
          <div className="flex items-center justify-between py-0.5">
            <div>
              <div className="text-[var(--foreground)] font-medium text-[12px]">Solar / Bus Charging</div>
              <div className="text-[11px] text-[var(--secondary)]">
                {params.charging ? 'Active charging (+0.5%/tick)' : 'Off · Slow natural drain'}
              </div>
            </div>
            <button
              type="button"
              onClick={toggleCharging}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                params.charging ? 'bg-emerald-500' : 'bg-[var(--border)]'
              }`}
              role="switch"
              aria-checked={Boolean(params.charging)}
              aria-label="Toggle solar or bus charging"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  params.charging ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 1. Temperature */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[var(--foreground)] font-medium">Temperature</span>
            <span className="text-[var(--secondary)] font-mono text-[12px]">
              {params.temperature.toFixed(1)} °C
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="0.1"
            value={params.temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            aria-label="Temperature slider"
          />
        </div>

        {/* 2. Humidity */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[var(--foreground)] font-medium">Humidity</span>
            <span className="text-[var(--secondary)] font-mono text-[12px]">
              {Math.round(params.humidity)} %
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={params.humidity}
            onChange={(e) => setHumidity(parseFloat(e.target.value))}
            aria-label="Humidity slider"
          />
        </div>

        {/* 3. Air Quality (MQ135) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[var(--foreground)] font-medium">Air quality</span>
            <span className="text-[var(--secondary)] font-mono text-[12px]">
              {Math.round(params.airQuality)} AQI
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="1"
            value={params.airQuality}
            onChange={(e) => setAirQuality(parseFloat(e.target.value))}
            aria-label="Air quality slider"
          />
        </div>

        {/* 4. Infrared / Heat (IR) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[var(--foreground)] font-medium">Infrared</span>
            <span className="text-[var(--secondary)] font-mono text-[12px]">
              {Math.round(params.infrared)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={params.infrared}
            onChange={(e) => setInfrared(parseFloat(e.target.value))}
            aria-label="Infrared slider"
          />
        </div>

        {/* 5. Atmospheric Pressure */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[var(--foreground)] font-medium">Pressure</span>
            <span className="text-[var(--secondary)] font-mono text-[12px]">
              {Math.round(params.pressure)} hPa
            </span>
          </div>
          <input
            type="range"
            min="950"
            max="1050"
            step="0.5"
            value={params.pressure}
            onChange={(e) => setPressure(parseFloat(e.target.value))}
            aria-label="Atmospheric pressure slider"
          />
        </div>
      </div>

      {/* 6. Harmful Gases Multi-Select */}
      <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5 mt-2">
        <div className="text-[var(--foreground)] font-medium text-[12px]">
          Harmful gases
        </div>
        <div className="grid grid-cols-1 gap-1">
          {GAS_OPTIONS.map((gas) => {
            const isSelected =
              gas.id === 'none' ? isNoneSelected : params.gases.includes(gas.id)

            return (
              <button
                key={gas.id}
                type="button"
                onClick={() => {
                  if (gas.id === 'none') {
                    clearGases()
                  } else {
                    toggleGas(gas.id)
                  }
                }}
                className={`w-full text-left px-2.5 py-1 rounded-[6px] text-[12px] border transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[var(--surface-hover)] text-[var(--foreground)] border-[var(--border)] font-medium'
                    : 'bg-transparent text-[var(--secondary)] border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <span>{gas.label}</span>
                <span className="text-[11px] font-mono text-[var(--muted)]">
                  {isSelected ? 'Selected' : 'Off'}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

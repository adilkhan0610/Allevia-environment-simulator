import React from 'react'
import { useSimulatorStore, type GasType } from '@/store/simulatorStore'

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

  const isNoneSelected = params.gases.length === 0

  return (
    <div className="w-full h-full flex flex-col justify-between p-3.5 sm:p-4 bg-[var(--surface)] text-[var(--foreground)] rounded-[16px] border border-[var(--border)] shadow-[var(--shadow-panel)] overflow-hidden text-[13px] transition-colors">
      <div className="space-y-2.5 sm:space-y-3">
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
      <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
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

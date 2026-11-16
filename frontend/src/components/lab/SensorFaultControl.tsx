import React, { useState } from 'react'
import { SurfacePanel } from '@/components/ui/panels'
import { Wrench, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

interface SensorFaultControlProps {
  onInjectFault: (sensorName: string, faultType: string | null) => void
  onClearAllFaults: () => void
  activeFaults: Record<string, string | null>
}

export const SensorFaultControl: React.FC<SensorFaultControlProps> = ({
  onInjectFault,
  onClearAllFaults,
  activeFaults,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const faultCatalog = [
    {
      sensor: 'bme280',
      label: 'BME280 Environmental',
      options: [
        { id: 'i2c_disconnect', label: 'I2C Bus Lockup (-999°C)' },
        { id: 'stuck_high', label: 'Railed High (85°C / 100% RH)' },
      ],
    },
    {
      sensor: 'mq2',
      label: 'MQ-2 Smoke/Gas',
      options: [
        { id: 'open_circuit', label: 'Open Circuit (ADC 1023)' },
        { id: 'short_circuit', label: 'Short to Ground (ADC 0)' },
        { id: 'erratic', label: 'Erratic Fluctuations' },
      ],
    },
    {
      sensor: 'mq7',
      label: 'MQ-7 Carbon Monoxide',
      options: [
        { id: 'open_circuit', label: 'Open Circuit Pull-up (ADC 1023)' },
        { id: 'short_circuit', label: 'Short Circuit (ADC 0)' },
      ],
    },
    {
      sensor: 'mq135',
      label: 'MQ-135 Air Quality',
      options: [
        { id: 'open_circuit', label: 'Sensor Dropout (ADC 1023)' },
        { id: 'short_circuit', label: 'Pin Ground Short (ADC 0)' },
      ],
    },
    {
      sensor: 'ir',
      label: 'IR Optical Flag',
      options: [
        { id: 'stuck_on', label: 'Permanently Stuck High (1)' },
        { id: 'stuck_off', label: 'Stuck Low (0)' },
      ],
    },
  ]

  const activeFaultCount = Object.values(activeFaults).filter(Boolean).length

  return (
    <SurfacePanel className="border border-[var(--border-subtle)] p-4 rounded-xl">
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2.5">
          <Wrench className="w-4 h-4 text-[var(--accent-primary)]" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground-default)] flex items-center gap-2">
              Sensor Fault Injection &amp; Diagnostics
              {activeFaultCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                  {activeFaultCount} ACTIVE FAULT{activeFaultCount > 1 ? 'S' : ''}
                </span>
              )}
            </h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Simulate hardware malfunctions, bus lockups, and broken lines.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeFaultCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClearAllFaults()
              }}
              className="text-[11px] font-mono px-2 py-1 bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] text-[var(--accent-primary)] rounded border border-[var(--border-subtle)] transition-colors"
            >
              Clear All Faults
            </button>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--foreground-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />}
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {faultCatalog.map((item) => {
            const currentFault = activeFaults[item.sensor]
            return (
              <div
                key={item.sensor}
                className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg text-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[var(--foreground-default)]">{item.label}</span>
                  {currentFault ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-red-400">
                      <AlertTriangle className="w-3 h-3" /> FAULT
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> NORMAL
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  {item.options.map((opt) => {
                    const isSelected = currentFault === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onInjectFault(item.sensor, isSelected ? null : opt.id)}
                        className={`w-full text-left px-2 py-1 rounded text-[11px] font-mono transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-medium'
                            : 'bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] border border-[var(--border-subtle)]/40'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <span className="text-[10px]">ACTIVE</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SurfacePanel>
  )
}

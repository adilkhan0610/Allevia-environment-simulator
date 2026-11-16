import React from 'react'
import { SurfacePanel } from '@/components/ui/panels'
import { ArrowLeft, Play, Pause, RotateCcw, Clock, ShieldAlert } from 'lucide-react'
import { TierBadge } from '@/components/ui/status'
import { DetectorBoxLazy } from '@/three/DetectorBoxLazy'
import type { TelemetryPacketData } from '@/types/telemetry'

interface JudgePresentationModalProps {
  scenarioName: string
  simTimeSec: number
  status: string
  latestPacket: TelemetryPacketData | null
  onPlay: () => void
  onPause: () => void
  onReset: () => void
  onExit: () => void
}

export const JudgePresentationModal: React.FC<JudgePresentationModalProps> = ({
  scenarioName,
  simTimeSec,
  status,
  latestPacket,
  onPlay,
  onPause,
  onReset,
  onExit,
}) => {
  const readings = latestPacket?.readings
  const activeEvents = latestPacket?.active_events || []
  const tier = latestPacket?.simulated_tier || 'GREEN'

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 sm:p-8 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="px-3 py-1.5 rounded-lg bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--foreground-default)] flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Exit Presentation Mode
          </button>
          <div className="h-4 w-[1px] bg-[var(--border-subtle)]" />
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground-default)]">
            ALLEVIA Hardware Demonstration • {scenarioName}
          </h1>
          <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-cyan-500/10 text-[var(--accent-primary)] rounded border border-cyan-500/30">
            SIMULATED TWIN
          </span>
        </div>

        {/* Big Tier Badge & Time */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm font-mono text-[var(--foreground-default)]">
            <Clock className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>T+{simTimeSec.toFixed(1)}s</span>
          </div>
          <TierBadge tier={tier} />
        </div>
      </div>

      {/* Main Presentation Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        {/* 3D Hardware Twin (Center-Left 7 cols) */}
        <div className="lg:col-span-7 h-[480px] lg:h-[580px] bg-black/50 border border-[var(--border-subtle)] rounded-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-4 left-4 z-10 text-xs font-mono text-[var(--foreground-muted)] bg-black/60 px-3 py-1 rounded border border-[var(--border-subtle)]">
            ALLEVIA DETECTOR BOX • PHYSICAL DIGITAL TWIN
          </div>
          <div className="flex-1 w-full h-full">
            <DetectorBoxLazy />
          </div>
        </div>

        {/* High-Readability Vital Signs (Right 5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <SurfacePanel className="p-6 rounded-2xl border border-[var(--border-subtle)] space-y-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-[var(--foreground-muted)]">
              Primary Environmental Metrics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl">
                <span className="text-xs font-mono text-orange-400">TEMPERATURE</span>
                <div className="text-3xl font-mono font-bold text-[var(--foreground-default)] mt-1">
                  {readings?.bme280.temperature_c.toFixed(1) ?? '22.0'}°C
                </div>
                <span className="text-[10px] font-mono text-[var(--foreground-muted)]">Bosch BME280 (I2C)</span>
              </div>

              <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl">
                <span className="text-xs font-mono text-cyan-400">HUMIDITY</span>
                <div className="text-3xl font-mono font-bold text-[var(--foreground-default)] mt-1">
                  {readings?.bme280.humidity_pct.toFixed(0) ?? '48'}%
                </div>
                <span className="text-[10px] font-mono text-[var(--foreground-muted)]">Relative RH</span>
              </div>

              <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl">
                <span className="text-xs font-mono text-amber-400">SMOKE / GAS</span>
                <div className="text-3xl font-mono font-bold text-[var(--foreground-default)] mt-1">
                  {readings?.mq2_raw ?? 125} <span className="text-sm font-normal text-[var(--foreground-muted)]">ADC</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--foreground-muted)]">MQ-2 Analog Pin A0</span>
              </div>

              <div className="p-4 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl">
                <span className="text-xs font-mono text-red-400">CARBON MONOXIDE</span>
                <div className="text-3xl font-mono font-bold text-[var(--foreground-default)] mt-1">
                  {readings?.mq7_raw ?? 95} <span className="text-sm font-normal text-[var(--foreground-muted)]">ADC</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--foreground-muted)]">MQ-7 Analog Pin A1</span>
              </div>
            </div>

            {/* Active Hazard Warning Alert Box */}
            <div className="pt-2">
              <span className="text-xs font-mono tracking-widest uppercase text-[var(--foreground-muted)] flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Simulated Hazard Evaluation
              </span>
              {activeEvents.length === 0 ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-300">
                  Nominal conditions: All environmental channels operating within baseline safety boundaries.
                </div>
              ) : (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-mono text-red-200">
                  <div className="font-bold uppercase text-[11px] mb-1">
                    [{activeEvents[0].severity}] {activeEvents[0].event_category} HAZARD DETECTED
                  </div>
                  <p className="font-sans text-xs leading-relaxed opacity-95">
                    {activeEvents[0].human_explanation}
                  </p>
                </div>
              )}
            </div>
          </SurfacePanel>

          {/* Quick Presentation Transport Bar */}
          <div className="flex items-center justify-between p-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono">
            <span className="text-[var(--foreground-muted)]">SIMULATION CONTROLS</span>
            <div className="flex items-center gap-2">
              {status !== 'RUNNING' ? (
                <button
                  type="button"
                  onClick={onPlay}
                  className="px-3 py-1.5 bg-[var(--accent-primary)] text-black font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Play
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPause}
                  className="px-3 py-1.5 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--foreground-default)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              )}
              <button
                type="button"
                onClick={onReset}
                className="px-3 py-1.5 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

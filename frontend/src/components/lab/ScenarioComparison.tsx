import React, { useState } from 'react'
import { SurfacePanel } from '@/components/ui/panels'
import { Scale, ChevronDown, ChevronUp } from 'lucide-react'

interface ScenarioComparisonProps {
  onSelectScenario: (id: string) => void
}

interface BenchmarkComparison {
  title: string
  baseline: string
  stressed: string
  tempDelta: string
  humDelta: string
  mq2Delta: string
  mq7Delta: string
  firstWarningTime: string
  maxTier: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED'
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  onSelectScenario,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const comparisons: BenchmarkComparison[] = [
    {
      title: 'Normal Day vs Midday Heatwave',
      baseline: 'Normal Day (scenario-01)',
      stressed: 'Midday Heatwave (scenario-02)',
      tempDelta: '+21.5°C rise (22°C → 43.5°C)',
      humDelta: '-29% drop (48% → 19%)',
      mq2Delta: '+15 counts (thermal baseline drift)',
      mq7Delta: '+10 counts (thermal baseline drift)',
      firstWarningTime: 'T+80s (at 32.0°C threshold)',
      maxTier: 'RED',
    },
    {
      title: 'Normal Day vs Humid Heat',
      baseline: 'Normal Day (scenario-01)',
      stressed: 'Humid Heat (scenario-03)',
      tempDelta: '+14.2°C rise (22°C → 36.2°C)',
      humDelta: '+46% surge (48% → 94% RH)',
      mq2Delta: '+20 counts (humidity conductivity drift)',
      mq7Delta: '+15 counts',
      firstWarningTime: 'T+110s (Wet-Bulb warning)',
      maxTier: 'RED',
    },
    {
      title: 'Normal Day vs Smoke/Dust Episode',
      baseline: 'Normal Day (scenario-01)',
      stressed: 'Smoke/Dust Episode (scenario-04)',
      tempDelta: '+3.5°C combustion rise (23°C → 26.5°C)',
      humDelta: '-7% drop',
      mq2Delta: '+655 counts spike (125 → 780 ADC)',
      mq7Delta: '+185 counts secondary CO (95 → 280 ADC)',
      firstWarningTime: 'T+60s (Particulate & IR occlusion)',
      maxTier: 'RED',
    },
    {
      title: 'Normal Day vs Gas Leak Demo',
      baseline: 'Normal Day (scenario-01)',
      stressed: 'Gas Leak (scenario-05)',
      tempDelta: '0.0°C ambient baseline',
      humDelta: '0.0% ambient baseline',
      mq2Delta: '+485 counts combustible secondary (125 → 610)',
      mq7Delta: '+795 counts critical CO spike (95 → 890 ADC)',
      firstWarningTime: 'T+65s (Toxic CO advisory)',
      maxTier: 'RED',
    },
  ]

  return (
    <SurfacePanel className="border border-[var(--border-subtle)] p-4 rounded-xl">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2.5">
          <Scale className="w-4 h-4 text-[var(--accent-primary)]" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground-default)] flex items-center gap-2">
              Scenario Comparative Benchmarks
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-[var(--accent-primary)] rounded border border-cyan-500/20">
                BENCHMARKS
              </span>
            </h3>
            <p className="text-xs text-[var(--foreground-muted)]">
              Evaluate sensor response deltas and time-to-first-warning across conditions.
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-[var(--foreground-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />}
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] space-y-3">
          {comparisons.map((comp) => (
            <div
              key={comp.title}
              className="p-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[var(--foreground-default)] text-sm">{comp.title}</span>
                <span className="px-2 py-0.5 text-[10px] rounded border bg-red-500/10 border-red-500/30 text-red-400">
                  PEAK TIER: {comp.maxTier}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-[var(--foreground-muted)] mb-2">
                <div className="p-2 bg-[var(--surface-elevated)] rounded border border-[var(--border-subtle)]/50">
                  <span className="text-[10px] block text-[var(--foreground-subtle)]">TEMP DELTA</span>
                  <span className="text-[var(--foreground-default)] font-semibold">{comp.tempDelta}</span>
                </div>
                <div className="p-2 bg-[var(--surface-elevated)] rounded border border-[var(--border-subtle)]/50">
                  <span className="text-[10px] block text-[var(--foreground-subtle)]">HUMIDITY DELTA</span>
                  <span className="text-[var(--foreground-default)] font-semibold">{comp.humDelta}</span>
                </div>
                <div className="p-2 bg-[var(--surface-elevated)] rounded border border-[var(--border-subtle)]/50">
                  <span className="text-[10px] block text-[var(--foreground-subtle)]">MQ-2 DELTA</span>
                  <span className="text-[var(--foreground-default)] font-semibold">{comp.mq2Delta}</span>
                </div>
                <div className="p-2 bg-[var(--surface-elevated)] rounded border border-[var(--border-subtle)]/50">
                  <span className="text-[10px] block text-[var(--foreground-subtle)]">FIRST WARNING</span>
                  <span className="text-amber-400 font-semibold">{comp.firstWarningTime}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const id = comp.stressed.includes('02')
                      ? 'scenario-02'
                      : comp.stressed.includes('03')
                      ? 'scenario-03'
                      : comp.stressed.includes('04')
                      ? 'scenario-04'
                      : 'scenario-05'
                    onSelectScenario(id)
                  }}
                  className="px-2.5 py-1 text-[11px] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--accent-primary)] rounded border border-[var(--border-subtle)] transition-colors"
                >
                  Load {comp.stressed.split('(')[0].trim()} →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SurfacePanel>
  )
}

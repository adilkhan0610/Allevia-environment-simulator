import React from 'react'
import { SurfacePanel } from '@/components/ui/panels'
import { SCENARIO_WALKTHROUGHS, type GuidedStep } from './guidedWalkthroughData'
import { TierBadge } from '@/components/ui/status'
import { BookOpen, CheckCircle, Clock, ChevronRight } from 'lucide-react'

interface GuidedWalkthroughProps {
  scenarioId: string
  simTimeSec: number
  onJumpToTime?: (timeSec: number) => void
}

export const GuidedWalkthrough: React.FC<GuidedWalkthroughProps> = ({
  scenarioId,
  simTimeSec,
  onJumpToTime,
}) => {
  const walkthrough = SCENARIO_WALKTHROUGHS[scenarioId] || SCENARIO_WALKTHROUGHS['scenario-01']

  // Find active step
  const activeStepIndex = walkthrough.steps.reduce((acc, step, idx) => {
    return simTimeSec >= step.timeSec ? idx : acc
  }, 0)

  const activeStep: GuidedStep = walkthrough.steps[activeStepIndex]

  return (
    <SurfacePanel className="border border-[var(--border-subtle)] p-4 rounded-xl">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--accent-primary)]" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground-default)]">
              Guided Demonstration Mode
            </h3>
            <p className="text-[11px] text-[var(--foreground-muted)]">
              {walkthrough.title} • {walkthrough.tagline}
            </p>
          </div>
        </div>
        <TierBadge tier={activeStep.expectedTier} />
      </div>

      {/* Progress Timeline Tracker */}
      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
        {walkthrough.steps.map((step, idx) => {
          const isPassed = simTimeSec >= step.timeSec
          const isCurrent = idx === activeStepIndex
          return (
            <button
              key={step.title}
              type="button"
              onClick={() => onJumpToTime && onJumpToTime(step.timeSec)}
              className={`p-2 rounded-lg text-left transition-all border text-xs font-mono flex flex-col justify-between ${
                isCurrent
                  ? 'bg-cyan-500/10 border-[var(--accent-primary)] text-[var(--foreground-default)]'
                  : isPassed
                  ? 'bg-[var(--surface-secondary)] border-emerald-500/30 text-[var(--foreground-muted)]'
                  : 'bg-[var(--surface-secondary)]/50 border-[var(--border-subtle)]/40 text-[var(--foreground-subtle)]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span>T+{step.timeSec}s</span>
                {isPassed && <CheckCircle className="w-3 h-3 text-emerald-400" />}
              </div>
              <span className="font-semibold truncate text-[11px]">{step.title}</span>
            </button>
          )
        })}
      </div>

      {/* Active Step Highlight Card */}
      <div className="mt-3 p-3 bg-[var(--surface-secondary)] border border-[var(--border-subtle)] rounded-lg">
        <div className="flex items-center justify-between text-xs font-mono mb-1">
          <span className="font-bold text-[var(--accent-primary)] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Active Phase: {activeStep.title} (from T+{activeStep.timeSec}s)
          </span>
          <span className="text-[10px] text-[var(--foreground-muted)]">
            Sensors: {activeStep.expectedSensors.join(', ')}
          </span>
        </div>
        <p className="text-xs text-[var(--foreground-default)] leading-relaxed mb-1.5">
          {activeStep.description}
        </p>
        <div className="text-[11px] font-mono text-cyan-300/90 bg-cyan-950/30 p-2 rounded border border-cyan-800/30 flex items-start gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[var(--accent-primary)]" />
          <span><strong>Key Observation:</strong> {activeStep.keyObservations}</span>
        </div>
      </div>
    </SurfacePanel>
  )
}

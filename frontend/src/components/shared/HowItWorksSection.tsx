import React from 'react'
import { Link } from 'react-router-dom'
import { GlassPanel } from '@/components/ui/panels'
import { SecondaryButton } from '@/components/ui/buttons'
import { SectionHeading, BodyText, EyebrowLabel } from '@/components/ui/typography'
import { ArrowRight, Radio, Cpu, Activity, ShieldCheck, AlertCircle } from 'lucide-react'

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'DETECT',
      icon: Radio,
      summary: 'Environmental sensors capture ambient readings.',
      detail:
        'Continuous sampling of BME280 temperature/humidity/pressure, MQ metal oxide analog resistances, and optical IR flags.',
    },
    {
      num: '02',
      title: 'TRANSMIT',
      icon: Cpu,
      summary: 'Virtual device generates telemetry packets.',
      detail:
        'Analog signals are quantized into 10-bit integer registers (0–1023 ADC) and framed into hardware JSON telemetry packets.',
    },
    {
      num: '03',
      title: 'UNDERSTAND',
      icon: Activity,
      summary: 'Simulation engine evaluates changing conditions.',
      detail:
        'Deterministic mathematical models inject thermal drift, Johnson noise, and gas curve dynamics across active scenarios.',
    },
    {
      num: '04',
      title: 'ACT',
      icon: ShieldCheck,
      summary: 'System displays resulting simulated response.',
      detail:
        'Simulated tier transitions (GREEN to RED) update the virtual Detector Box perimeter glow and trigger audio-visual warnings.',
    },
  ]

  return (
    <section id="how-it-works" className="w-full py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[var(--layout-wide)] px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
          <div className="max-w-2xl space-y-2">
            <EyebrowLabel>END-TO-END TELEMETRY PIPELINE</EyebrowLabel>
            <SectionHeading as="h2" className="text-3xl sm:text-4xl">
              From Physical Atmospheric Physics to Early Warning
            </SectionHeading>
            <BodyText>
              How our virtual twin models physical sensor dynamics, serial packet assembly, and real-time early warning tier transitions.
            </BodyText>
          </div>

          <Link to="/about">
            <SecondaryButton size="md" icon={<ArrowRight className="h-4 w-4" />}>
              Explore Full Architecture
            </SecondaryButton>
          </Link>
        </div>

        {/* 4 Pipeline Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <GlassPanel
                key={step.num}
                variant="standard"
                className="relative flex flex-col justify-between p-6 space-y-6 hover:border-[var(--accent)] transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-light text-[var(--accent)]">
                      {step.num}
                    </span>
                    <div className="p-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--accent)] border border-[var(--border)]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="font-display font-semibold text-lg tracking-wide text-[var(--foreground)]">
                    {step.title}
                  </h3>

                  <p className="text-xs font-semibold text-[var(--foreground-secondary)] font-body">
                    {step.summary}
                  </p>

                  <p className="text-xs text-[var(--foreground-muted)] font-mono leading-relaxed">
                    {step.detail}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--foreground-muted)] uppercase">
                  Step {step.num} of 04
                </div>
              </GlassPanel>
            )
          })}
        </div>

        {/* Data Isolation Notice Box */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--accent)]/30 bg-[var(--accent-muted)] p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[var(--accent)] mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-semibold uppercase text-[var(--foreground)]">
                Local Simulation Architecture Notice
              </h4>
              <p className="text-xs text-[var(--foreground-secondary)] font-mono">
                In this standalone stage, risk assessments and tier transitions are computed by the local simulation engine.
                The live ALLEVIA platform risk engine connects in Phase 10 via our pluggable adapter bridge.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-[var(--radius-xs)] text-[10px] font-mono uppercase tracking-wider bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--accent)] whitespace-nowrap">
            source = &quot;simulated&quot;
          </span>
        </div>
      </div>
    </section>
  )
}

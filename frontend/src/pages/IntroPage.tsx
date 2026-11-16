import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/Containers'
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons'
import { GlassPanel } from '@/components/ui/panels'
import { DisplayHeading, BodyText, EyebrowLabel } from '@/components/ui/typography'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { apiClient } from '@/services/apiClient'
import { useSimulationStore } from '@/store/simulationStore'
import { ArrowRight, Box, Cpu, ShieldAlert, Sparkles } from 'lucide-react'

export const IntroPage: React.FC = () => {
  const scenarios = useSimulationStore((s) => s.scenarios)
  const setScenarios = useSimulationStore((s) => s.setScenarios)

  useEffect(() => {
    apiClient
      .getScenarios()
      .then((res) => setScenarios(res.scenarios))
      .catch((err) => console.warn('Failed to fetch scenarios in intro:', err))
  }, [setScenarios])

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:py-20">
      <PageContainer>
        {/* Hero Section */}
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-muted)] text-[var(--accent)] text-xs font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Virtual Twin Simulator • Standalone Architecture</span>
          </div>

          <DisplayHeading as="h1" className="text-4xl sm:text-6xl leading-tight">
            ALLEVIA <span className="text-[var(--accent)]">Detector Box</span> Simulator
          </DisplayHeading>

          <BodyText size="lg" className="max-w-2xl">
            Experience our physical hardware detector box in real-time 3D. Inspect internal sensors,
            simulate environmental hazard scenarios, and observe 10-bit ADC telemetry generation with strict data isolation.
          </BodyText>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/lab">
              <PrimaryButton size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                Enter Interactive Lab
              </PrimaryButton>
            </Link>
            <Link to="/about">
              <SecondaryButton size="lg">
                Hardware Architecture
              </SecondaryButton>
            </Link>
          </div>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <GlassPanel variant="standard" interactive className="space-y-3">
            <div className="p-2 w-fit rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/20">
              <Box className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">3D Hardware Twin</h3>
            <BodyText size="sm">
              Interactive exploded-view visualization of the Arduino Uno, BME280, MQ-2, MQ-7, MQ-135, and IR sensors.
            </BodyText>
          </GlassPanel>

          <GlassPanel variant="standard" interactive className="space-y-3">
            <div className="p-2 w-fit rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">6 Environmental Scenarios</h3>
            <BodyText size="sm">
              Simulate heatwaves, toxic carbon monoxide leaks, smoke episodes, and hardware fault conditions.
            </BodyText>
          </GlassPanel>

          <GlassPanel variant="standard" interactive className="space-y-3">
            <div className="p-2 w-fit rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/20">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Real-Time Telemetry</h3>
            <BodyText size="sm">
              Low-latency bi-directional WebSocket streaming with 10-bit ADC registers and local simulated risk tiers.
            </BodyText>
          </GlassPanel>
        </div>

        {/* Loaded Scenarios Preview */}
        {scenarios.length > 0 && (
          <div className="mt-12 p-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-elevated)]">
            <div className="flex items-center justify-between mb-3">
              <EyebrowLabel>Available Scenarios ({scenarios.length})</EyebrowLabel>
              <StatusBadge status="FOUNDATION READY" variant="cyan" />
            </div>
            <div className="flex flex-wrap gap-2">
              {scenarios.map((sc) => (
                <span
                  key={sc.id}
                  className="px-3 py-1 rounded-[var(--radius-sm)] text-xs font-mono bg-[var(--surface)] text-[var(--foreground-secondary)] border border-[var(--border)]"
                >
                  {sc.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  )
}

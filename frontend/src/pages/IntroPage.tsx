import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons'
import { GlassPanel } from '@/components/ui/panels'
import { DisplayHeading, SectionHeading, BodyText, EyebrowLabel } from '@/components/ui/typography'
import { StatusIndicator, SimulatedBadge } from '@/components/ui/status'
import { DetectorBoxVisual } from '@/components/shared/DetectorBoxVisual'
import { HardwareStrip } from '@/components/shared/HardwareStrip'
import { HowItWorksSection } from '@/components/shared/HowItWorksSection'
import { apiClient } from '@/services/apiClient'
import { useSimulationStore } from '@/store/simulationStore'
import { fadeIn, fadeUp, staggerContainer } from '@/animations/presets'
import { ArrowRight, Activity, Flame, ShieldAlert, Thermometer, Wind, Zap } from 'lucide-react'

export const IntroPage: React.FC = () => {
  const navigate = useNavigate()
  const scenarios = useSimulationStore((s) => s.scenarios)
  const setScenarios = useSimulationStore((s) => s.setScenarios)
  const setSelectedScenarioId = useSimulationStore((s) => s.setSelectedScenarioId)

  useEffect(() => {
    if (scenarios.length === 0) {
      apiClient
        .getScenarios()
        .then((res) => setScenarios(res.scenarios))
        .catch((err) => console.warn('Failed to fetch scenarios in intro:', err))
    }
  }, [scenarios.length, setScenarios])

  const handleLaunchScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId)
    navigate('/lab')
  }

  const scenarioIcons: Record<string, React.ReactNode> = {
    'scenario-01': <Activity className="h-4 w-4 text-[var(--status-green)]" />,
    'scenario-02': <Thermometer className="h-4 w-4 text-[var(--status-orange)]" />,
    'scenario-03': <Wind className="h-4 w-4 text-[var(--status-red)]" />,
    'scenario-04': <Flame className="h-4 w-4 text-[var(--status-orange)]" />,
    'scenario-05': <ShieldAlert className="h-4 w-4 text-[var(--status-red)]" />,
    'scenario-06': <Zap className="h-4 w-4 text-[var(--accent)]" />,
  }

  return (
    <div id="overview" className="flex-1 flex flex-col w-full selection:bg-[var(--accent)] selection:text-[var(--background)]">
      {/* ==================================================
          1. FULL-SCREEN HERO SECTION
          ================================================== */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 lg:py-20 overflow-hidden">
        {/* Subtle Ambient Background Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-[var(--accent)] opacity-[0.06] blur-[120px] pointer-events-none rounded-full" />

        <div className="mx-auto w-full max-w-[var(--layout-wide)] px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
          >
            {/* Left Column: Hero Narrative */}
            <motion.div variants={fadeUp} className="lg:col-span-7 space-y-6 lg:pr-8">
              {/* Eyebrow Label */}
              <div className="flex items-center gap-3">
                <span className="led-indicator led-pulse" />
                <EyebrowLabel className="text-[var(--accent)] font-semibold tracking-[0.2em]">
                  ENVIRONMENTAL INTELLIGENCE SYSTEM
                </EyebrowLabel>
                <SimulatedBadge />
              </div>

              {/* Main Headline */}
              <DisplayHeading as="h1" className="text-4xl sm:text-6xl xl:text-7xl leading-[1.05] tracking-tight">
                YOUR ENVIRONMENT.
                <span className="block text-[var(--accent)] mt-1">UNDER OBSERVATION.</span>
              </DisplayHeading>

              {/* Supporting Description */}
              <BodyText size="lg" className="max-w-xl text-[var(--foreground-secondary)] leading-relaxed">
                A virtual window into the ALLEVIA sensing system. Explore environmental scenarios,
                inspect sensor behaviour and observe how changing conditions are processed.
              </BodyText>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link to="/lab">
                  <PrimaryButton size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                    START SIMULATION
                  </PrimaryButton>
                </Link>
                <Link to="/about">
                  <SecondaryButton size="lg">
                    EXPLORE THE SYSTEM
                  </SecondaryButton>
                </Link>
              </div>

              {/* Technical Footnote / Watermark */}
              <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center gap-2 text-[11px] font-mono text-[var(--foreground-muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                <span>SIMULATED DEMONSTRATION • REAL BACKEND COMPATIBLE VIA PHASE 10 ADAPTER</span>
              </div>
            </motion.div>

            {/* Right Column: Sophisticated Physical Detector Box Visual Placeholder */}
            <motion.div variants={fadeIn} className="lg:col-span-5 flex justify-center">
              <DetectorBoxVisual />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================================================
          2. TECHNICAL HARDWARE STRIP
          ================================================== */}
      <HardwareStrip />

      {/* ==================================================
          3. HOW IT WORKS SECTION
          ================================================== */}
      <HowItWorksSection />

      {/* ==================================================
          4. ENVIRONMENTAL SCENARIO MATRIX PREVIEW
          ================================================== */}
      <section className="w-full py-16 sm:py-24 border-t border-[var(--border-subtle)] bg-[var(--surface)]/50">
        <div className="mx-auto w-full max-w-[var(--layout-wide)] px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[var(--border-subtle)]">
            <div className="max-w-2xl space-y-2">
              <EyebrowLabel>PRE-CALIBRATED SIMULATION SUITE</EyebrowLabel>
              <SectionHeading as="h2" className="text-3xl sm:text-4xl">
                Six Rigorous Environmental Scenarios
              </SectionHeading>
              <BodyText>
                From benign workplace baselines to extreme thermal strain and toxic carbon monoxide spikes.
              </BodyText>
            </div>

            <Link to="/lab">
              <SecondaryButton size="md" icon={<ArrowRight className="h-4 w-4" />}>
                Launch All in Lab
              </SecondaryButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scenarios.map((sc) => (
              <GlassPanel
                key={sc.id}
                variant="standard"
                className="flex flex-col justify-between p-6 space-y-4 hover:border-[var(--accent)]/60 transition-all duration-200 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[var(--border)] text-[var(--accent)] bg-[var(--surface-elevated)] flex items-center gap-1.5">
                      {scenarioIcons[sc.id] || <Activity className="h-3 w-3" />}
                      {sc.category}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--foreground-muted)]">
                      {sc.duration_seconds}s cycle
                    </span>
                  </div>

                  <h3 className="font-display font-semibold text-lg text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                    {sc.name}
                  </h3>

                  <p className="text-xs text-[var(--foreground-secondary)] font-body line-clamp-2">
                    {sc.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="text-[10px] font-mono text-[var(--foreground-muted)]">
                    Primary: <span className="text-[var(--foreground)]">{sc.primary_threat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLaunchScenario(sc.id)}
                    className="text-xs font-mono font-medium text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Simulate <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          5. CALL TO ACTION SECTION
          ================================================== */}
      <section className="w-full py-20 border-t border-[var(--border-subtle)] relative overflow-hidden bg-[var(--surface-elevated)]">
        <div className="absolute inset-0 bg-radial from-[var(--accent-muted)] to-transparent pointer-events-none opacity-40" />
        <div className="mx-auto w-full max-w-[var(--layout-standard)] px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <StatusIndicator label="SYSTEM READY" variant="green" pulse />
          <DisplayHeading as="h2" className="text-3xl sm:text-5xl max-w-2xl mx-auto leading-tight">
            Observe the Virtual Twin in Real-Time
          </DisplayHeading>
          <BodyText size="lg" className="max-w-xl mx-auto">
            Step into the simulation lab, trigger environmental anomalies, and inspect live 10-bit ADC sensor registers.
          </BodyText>
          <div className="pt-4 flex justify-center">
            <Link to="/lab">
              <PrimaryButton size="lg" icon={<ArrowRight className="h-4 w-4" />}>
                Launch Simulation Lab Cockpit
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

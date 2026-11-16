import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PageContainer, SectionContainer } from '@/components/layout/Containers'
import {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  IconButton,
} from '@/components/ui/buttons'
import { GlassPanel, SurfacePanel, SectionPanel } from '@/components/ui/panels'
import {
  StatusIndicator,
  ConnectionIndicator,
  SimulatedBadge,
  TierBadge,
} from '@/components/ui/status'
import {
  DisplayHeading,
  SectionHeading,
  BodyText,
  MonoValue,
  EyebrowLabel,
} from '@/components/ui/typography'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  fadeIn,
  fadeUp,
  scaleIn,
  staggerContainer,
} from '@/animations/presets'
import {
  Cpu,
  Flame,
  Zap,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  Box,
  Terminal,
} from 'lucide-react'

export const DesignSystemPreviewPage: React.FC = () => {
  const [btnLoading, setBtnLoading] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  const colorSwatches = [
    { name: '--background', label: 'Background', hexDark: '#050607', hexLight: '#F3F6F7' },
    { name: '--surface', label: 'Surface', hexDark: '#101316', hexLight: '#FFFFFF' },
    { name: '--surface-elevated', label: 'Surface Elevated', hexDark: '#181D21', hexLight: '#E9EFF2' },
    { name: '--accent', label: 'Cyan Accent', hexDark: '#00DDF5', hexLight: '#008DA8' },
    { name: '--border', label: 'Border', hexDark: '#28343A', hexLight: '#D8E0E4' },
    { name: '--foreground', label: 'Foreground', hexDark: '#F5F7F8', hexLight: '#10171B' },
    { name: '--status-green', label: 'Tier: Green', hexDark: '#10B981', hexLight: '#059669' },
    { name: '--status-yellow', label: 'Tier: Yellow', hexDark: '#F59E0B', hexLight: '#D97706' },
    { name: '--status-orange', label: 'Tier: Orange', hexDark: '#F97316', hexLight: '#EA580C' },
    { name: '--status-red', label: 'Tier: Red', hexDark: '#EF4444', hexLight: '#DC2626' },
  ]

  return (
    <PageContainer size="wide" className="space-y-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <EyebrowLabel>Internal Architecture</EyebrowLabel>
            <SimulatedBadge />
          </div>
          <DisplayHeading as="h1" className="text-3xl sm:text-4xl mt-2">
            Design System <span className="text-[var(--accent)]">v2.0</span>
          </DisplayHeading>
          <BodyText className="mt-1">
            Apple Hardware Precision × Futuristic Engineering Lab × ALLEVIA Identity
          </BodyText>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      {/* 1. Colour Palette */}
      <SectionContainer spacing="compact">
        <SectionHeading as="h2" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" />
          Core Colour Palette
        </SectionHeading>
        <BodyText size="sm">
          Strictly decoupled CSS variables supporting instant seamless transitions between dark and light themes.
        </BodyText>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
          {colorSwatches.map((color) => (
            <div
              key={color.name}
              className="p-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-elevated)] space-y-2"
            >
              <div
                className="h-12 w-full rounded-[var(--radius-sm)] border border-[var(--border-subtle)] shadow-inner"
                style={{ backgroundColor: `var(${color.name})` }}
              />
              <div>
                <p className="text-xs font-semibold text-[var(--foreground)]">{color.label}</p>
                <p className="text-[10px] font-mono text-[var(--foreground-muted)]">{color.name}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* 2. Typography Hierarchy */}
      <SectionContainer spacing="compact">
        <SectionHeading as="h2" className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[var(--accent)]" />
          Typography System (Space Grotesk • Inter • IBM Plex Mono)
        </SectionHeading>

        <SurfacePanel className="space-y-6">
          <div className="space-y-1">
            <EyebrowLabel>Display Heading (Space Grotesk Light Tracked)</EyebrowLabel>
            <DisplayHeading as="h3">DETECTOR BOX 3D TWIN</DisplayHeading>
          </div>

          <div className="space-y-1">
            <EyebrowLabel>Section Heading (Space Grotesk Medium)</EyebrowLabel>
            <SectionHeading as="h4">Atmospheric Telemetry &amp; Biosensing</SectionHeading>
          </div>

          <div className="space-y-1">
            <EyebrowLabel>Body Text (Inter Regular / Neo-Grotesk)</EyebrowLabel>
            <BodyText>
              The physical ALLEVIA Detector Box samples atmospheric metrics via analog and digital channels,
              evaluating environmental health risks for vulnerable workforces in real-time.
            </BodyText>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <EyebrowLabel>Monospace Tabular Values (IBM Plex Mono)</EyebrowLabel>
            <div className="flex flex-wrap gap-8 items-baseline">
              <MonoValue size="xl" unit="°C" highlight>
                42.8
              </MonoValue>
              <MonoValue size="lg" unit="%RH">
                68.2
              </MonoValue>
              <MonoValue size="md" unit="ADC">
                842
              </MonoValue>
              <MonoValue size="sm" unit="hPa">
                1013.25
              </MonoValue>
            </div>
          </div>
        </SurfacePanel>
      </SectionContainer>

      {/* 3. Button Component Hierarchy */}
      <SectionContainer spacing="compact">
        <SectionHeading as="h2" className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[var(--accent)]" />
          Button Components &amp; Interaction States
        </SectionHeading>

        <SurfacePanel className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <PrimaryButton icon={<Zap className="h-4 w-4" />}>
              Primary Action
            </PrimaryButton>
            <SecondaryButton icon={<Layers className="h-4 w-4" />}>
              Secondary Action
            </SecondaryButton>
            <GhostButton icon={<Box className="h-4 w-4" />}>
              Ghost Button
            </GhostButton>
            <IconButton
              icon={<RefreshCw className="h-4 w-4" />}
              aria-label="Refresh Component"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <PrimaryButton size="sm">Small</PrimaryButton>
            <PrimaryButton size="md">Medium</PrimaryButton>
            <PrimaryButton size="lg">Large Scale</PrimaryButton>
            <PrimaryButton
              isLoading={btnLoading}
              onClick={() => {
                setBtnLoading(true)
                setTimeout(() => setBtnLoading(false), 1200)
              }}
            >
              Click For Loading State
            </PrimaryButton>
            <PrimaryButton disabled>Disabled Action</PrimaryButton>
          </div>
        </SurfacePanel>
      </SectionContainer>

      {/* 4. Glassmorphism System */}
      <SectionContainer spacing="compact">
        <SectionHeading as="h2" className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[var(--accent)]" />
          Glassmorphism Surface Architecture
        </SectionHeading>
        <BodyText size="sm">
          A calm, refined glass aesthetic with controlled backdrop blur (24px), micro inner-highlights, and soft borders.
        </BodyText>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <GlassPanel variant="standard" interactive>
            <EyebrowLabel>Standard Glass</EyebrowLabel>
            <h4 className="text-base font-semibold text-[var(--foreground)] mt-2">.glass-panel</h4>
            <BodyText size="sm" className="mt-1">
              Base surface for telemetry cards and floating HUD overlays.
            </BodyText>
          </GlassPanel>

          <GlassPanel variant="strong" interactive>
            <EyebrowLabel>Strong Glass</EyebrowLabel>
            <h4 className="text-base font-semibold text-[var(--foreground)] mt-2">.glass-panel-strong</h4>
            <BodyText size="sm" className="mt-1">
              Solidified background with deeper blur for primary control drawers.
            </BodyText>
          </GlassPanel>

          <GlassPanel variant="subtle" interactive>
            <EyebrowLabel>Subtle Glass</EyebrowLabel>
            <h4 className="text-base font-semibold text-[var(--foreground)] mt-2">.glass-panel-subtle</h4>
            <BodyText size="sm" className="mt-1">
              Lightweight surface for inline pills, chips, and sub-panels.
            </BodyText>
          </GlassPanel>
        </div>
      </SectionContainer>

      {/* 5. LED Signature Effects */}
      <SectionContainer spacing="compact">
        <SectionHeading as="h2" className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-[var(--accent)]" />
          ALLEVIA LED Signature Effects
        </SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <SurfacePanel className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <span className="led-indicator led-pulse" />
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--foreground)]">.led-pulse</p>
              <p className="text-[11px] text-[var(--foreground-muted)]">Subtle 2.4s breathing glow</p>
            </div>
          </SurfacePanel>

          <SurfacePanel className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="h-10 w-28 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-xs font-mono led-glow text-[var(--accent)]">
              GLOW ACTIVE
            </div>
            <div>
              <p className="text-xs font-mono font-semibold text-[var(--foreground)]">.led-glow</p>
              <p className="text-[11px] text-[var(--foreground-muted)]">Controlled outer cyan luminance</p>
            </div>
          </SurfacePanel>

          <SurfacePanel className="flex flex-col items-center justify-center p-8 space-y-4 text-center led-edge rounded-[var(--radius-lg)]">
            <p className="text-xs font-mono font-semibold text-[var(--accent)]">.led-edge</p>
            <p className="text-[11px] text-[var(--foreground-muted)]">Perimeter highlight frame</p>
          </SurfacePanel>
        </div>
      </SectionContainer>

      {/* 6. Status Indicators & Badges */}
      <SectionContainer spacing="compact">
        <SectionHeading as="h2" className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--accent)]" />
          Status Badges &amp; Risk Tiers
        </SectionHeading>

        <SurfacePanel className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusIndicator label="SYSTEM NORMAL" variant="green" />
            <StatusIndicator label="THERMAL ADVISORY" variant="yellow" pulse />
            <StatusIndicator label="HIGH HAZARD" variant="orange" pulse />
            <StatusIndicator label="CRITICAL EMERGENCY" variant="red" pulse />
            <StatusIndicator label="STANDBY" variant="neutral" />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <TierBadge tier="GREEN" />
            <TierBadge tier="YELLOW" />
            <TierBadge tier="ORANGE" />
            <TierBadge tier="RED" />
            <TierBadge tier="FAULT" />
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <ConnectionIndicator status="CONNECTED" />
            <ConnectionIndicator status="CONNECTING" />
            <ConnectionIndicator status="DISCONNECTED" />
            <ConnectionIndicator status="ERROR" />
            <SimulatedBadge />
          </div>
        </SurfacePanel>
      </SectionContainer>

      {/* 7. Framer Motion Animation Presets */}
      <SectionContainer spacing="compact">
        <div className="flex items-center justify-between">
          <SectionHeading as="h2" className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[var(--accent)]" />
            Framer Motion Presets (200–400ms Restrained Transitions)
          </SectionHeading>
          <SecondaryButton
            size="sm"
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            onClick={() => setAnimKey((k) => k + 1)}
          >
            Re-trigger Motion
          </SecondaryButton>
        </div>

        <motion.div
          key={animKey}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2"
        >
          <motion.div variants={fadeIn}>
            <GlassPanel>
              <EyebrowLabel>Preset 1</EyebrowLabel>
              <h4 className="text-base font-semibold text-[var(--foreground)] mt-1">fadeIn</h4>
              <BodyText size="sm" className="mt-1">Smooth opacity blend in 300ms.</BodyText>
            </GlassPanel>
          </motion.div>

          <motion.div variants={fadeUp}>
            <GlassPanel>
              <EyebrowLabel>Preset 2</EyebrowLabel>
              <h4 className="text-base font-semibold text-[var(--foreground)] mt-1">fadeUp</h4>
              <BodyText size="sm" className="mt-1">Subtle 16px spring translation.</BodyText>
            </GlassPanel>
          </motion.div>

          <motion.div variants={scaleIn}>
            <GlassPanel>
              <EyebrowLabel>Preset 3</EyebrowLabel>
              <h4 className="text-base font-semibold text-[var(--foreground)] mt-1">scaleIn</h4>
              <BodyText size="sm" className="mt-1">0.95 to 1.0 micro spring scale.</BodyText>
            </GlassPanel>
          </motion.div>
        </motion.div>
      </SectionContainer>

      {/* 8. Spacing & Border Radii Guidelines */}
      <SectionPanel
        title="8px Grid Scale &amp; Generous Radius Tokens"
        subtitle="Consistent physical engineering measurements across all viewport scales"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--surface)]">
            <span className="text-[var(--foreground-muted)] block">--radius-sm</span>
            <span className="text-sm font-semibold text-[var(--foreground)]">8px</span>
          </div>
          <div className="p-3 border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)]">
            <span className="text-[var(--foreground-muted)] block">--radius-md</span>
            <span className="text-sm font-semibold text-[var(--foreground)]">16px</span>
          </div>
          <div className="p-3 border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--surface)]">
            <span className="text-[var(--foreground-muted)] block">--radius-lg</span>
            <span className="text-sm font-semibold text-[var(--foreground)]">20px</span>
          </div>
          <div className="p-3 border border-[var(--border)] rounded-[var(--radius-xl)] bg-[var(--surface)]">
            <span className="text-[var(--foreground-muted)] block">--radius-xl</span>
            <span className="text-sm font-semibold text-[var(--foreground)]">28px</span>
          </div>
        </div>
      </SectionPanel>
    </PageContainer>
  )
}
